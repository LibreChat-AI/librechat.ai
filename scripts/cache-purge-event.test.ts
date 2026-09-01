import { describe, expect, it } from 'vitest'
import {
  VERCEL_PROJECT_ID,
  selectPurgeState,
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

describe('selectPurgeState', () => {
  const status = (
    kind: 'cache-promotion' | 'cache-purge',
    sha: string,
    runNumber: string,
    createdAt: string,
    state = 'success',
  ) => ({
    context: `${kind}/dpl_test`,
    created_at: createdAt,
    description: `${runNumber}|${sha}|${kind}`,
    state,
  })

  it('uses promotion chronology when the current deployment rolls back', () => {
    const rollbackHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const latestDeployed = 'cccccccccccccccccccccccccccccccccccccccc'
    const olderDeployed = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [
          // The older promotion finishes last. Completion timestamps must not
          // override the workflow run numbers assigned at event delivery.
          [
            status('cache-promotion', olderDeployed, '10', '2026-09-01T13:00:00Z'),
            status('cache-purge', olderDeployed, '10', '2026-09-01T13:00:00Z'),
          ],
          [
            status('cache-promotion', latestDeployed, '11', '2026-09-01T12:00:00Z'),
            status('cache-purge', latestDeployed, '11', '2026-09-01T12:00:00Z'),
          ],
        ],
        rollbackHead,
        '12',
      ),
    ).toEqual({ base: latestDeployed, previous: latestDeployed })
  })

  it('keeps the same-commit predecessor but skips it as a diff baseline', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const previousHead = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [
          [
            status('cache-promotion', currentHead, '12', '2026-09-01T13:00:00Z'),
            status('cache-purge', currentHead, '12', '2026-09-01T13:00:00Z'),
            status('cache-promotion', previousHead, '11', '2026-09-01T12:00:00Z'),
            status('cache-purge', previousHead, '11', '2026-09-01T12:00:00Z'),
          ],
        ],
        currentHead,
        '13',
      ),
    ).toEqual({ base: previousHead, previous: currentHead })
  })

  it('retains an unpurged predecessor separately from the last success', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const unpurgedHead = 'cccccccccccccccccccccccccccccccccccccccc'
    const successfulHead = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [
          [
            status('cache-promotion', unpurgedHead, '11', '2026-09-01T13:00:00Z'),
            status('cache-promotion', successfulHead, '10', '2026-09-01T12:00:00Z'),
            status('cache-purge', successfulHead, '10', '2026-09-01T12:05:00Z'),
          ],
        ],
        currentHead,
        '12',
      ),
    ).toEqual({ base: successfulHead, previous: unpurgedHead })
  })

  it('ignores future, failed, and malformed ledger entries', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    expect(
      selectPurgeState(
        [
          [
            status(
              'cache-purge',
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              '10',
              '2026-09-01T12:00:00Z',
              'failure',
            ),
            status('cache-promotion', 'not-a-sha', '11', '2026-09-01T13:00:00Z'),
            status(
              'cache-promotion',
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              'not-a-run',
              '2026-09-01T14:00:00Z',
            ),
            status(
              'cache-promotion',
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              '13',
              '2026-09-01T15:00:00Z',
            ),
          ],
        ],
        currentHead,
        '12',
      ),
    ).toEqual({ base: null, previous: null })
  })
})
