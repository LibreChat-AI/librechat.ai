import { describe, expect, it } from 'vitest'
import {
  VERCEL_PROJECT_ID,
  selectPreviousPurgedCommit,
  validatePromotedDeployment,
} from './cache-purge-event.mjs'

const promoted = {
  environment: 'production',
  git: {
    ref: 'main',
    sha: 'e161206fa9fd03294430019666687e8f8e232201',
  },
  id: 'dpl_EnMFpT7NUGsYu5fDXNakPwBfDGSa',
  project: {
    id: VERCEL_PROJECT_ID,
    name: 'librechat-ai',
  },
  url: 'https://librechat-ai.example.vercel.app',
}

describe('validatePromotedDeployment', () => {
  it('returns the trusted routing fields for this project production branch', () => {
    expect(validatePromotedDeployment(promoted)).toEqual({
      deploymentId: 'dpl_EnMFpT7NUGsYu5fDXNakPwBfDGSa',
      head: 'e161206fa9fd03294430019666687e8f8e232201',
    })
  })

  it.each([
    ['preview environment', { environment: 'preview' }, 'not a production deployment'],
    [
      'different project',
      { project: { id: 'prj_other', name: 'other' } },
      'unexpected Vercel project',
    ],
    ['different branch', { git: { ...promoted.git, ref: 'docs' } }, 'not the production branch'],
    ['malformed SHA', { git: { ref: 'main', sha: 'main' } }, 'invalid Git commit SHA'],
    ['malformed deployment id', { id: '6204988438' }, 'invalid Vercel deployment ID'],
  ])('rejects a %s', (_name, patch, message) => {
    expect(() => validatePromotedDeployment({ ...promoted, ...patch })).toThrow(message)
  })
})

describe('selectPreviousPurgedCommit', () => {
  const status = (sha: string, createdAt: string) => ({
    context: 'cache-purge/dpl_test',
    created_at: createdAt,
    description: `${sha}|Purged 3 prefixes, 1 URLs`,
    state: 'success',
  })

  it('uses promotion chronology when the current deployment rolls back', () => {
    const rollbackHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const latestDeployed = 'cccccccccccccccccccccccccccccccccccccccc'
    const olderDeployed = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPreviousPurgedCommit(
        [
          [status(olderDeployed, '2026-08-30T12:00:00Z')],
          [status(latestDeployed, '2026-09-01T12:00:00Z')],
        ],
        rollbackHead,
      ),
    ).toBe(latestDeployed)
  })

  it('skips a prior deployment of the same commit', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const previousHead = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPreviousPurgedCommit(
        [
          [
            status(currentHead, '2026-09-01T13:00:00Z'),
            status(previousHead, '2026-09-01T12:00:00Z'),
          ],
        ],
        currentHead,
      ),
    ).toBe(previousHead)
  })

  it('ignores failed and malformed ledger entries', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    expect(
      selectPreviousPurgedCommit(
        [
          [
            {
              ...status('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '2026-09-01T12:00:00Z'),
              state: 'failure',
            },
            { ...status('not-a-sha', '2026-09-01T13:00:00Z') },
          ],
        ],
        currentHead,
      ),
    ).toBeNull()
  })
})
