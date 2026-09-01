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
  const status = (sha: string, runNumber: string, state = 'success') => ({
    context: 'cache-purge/dpl_test',
    description: `${runNumber}|${sha}|Purged`,
    state,
  })

  const runTitle = ({
    environment = 'production',
    projectId = VERCEL_PROJECT_ID,
    ref = 'main',
    sha = 'cccccccccccccccccccccccccccccccccccccccc',
  } = {}) => `cache-purge:${environment}:${projectId}:${ref}:${sha}:dpl_test`

  const run = (
    runNumber: number,
    {
      displayTitle = runTitle(),
      event = 'repository_dispatch',
    }: { displayTitle?: string; event?: string } = {},
  ) => ({
    display_title: displayTitle,
    event,
    run_number: runNumber,
  })

  it('selects the latest successful purge checkpoint across status pages', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const latestPurged = 'cccccccccccccccccccccccccccccccccccccccc'
    const olderPurged = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [[status(olderPurged, '10')], [status(latestPurged, '11'), status(currentHead, '13')]],
        [
          {
            workflow_runs: [
              run(10, { displayTitle: runTitle({ sha: olderPurged }) }),
              run(11, { displayTitle: runTitle({ sha: latestPurged }) }),
            ],
          },
        ],
        currentHead,
        '12',
      ),
    ).toEqual({ base: latestPurged, unsafe: [] })
  })

  it('uses a same-commit purge as the known-good checkpoint', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

    expect(
      selectPurgeState(
        [[status(currentHead, '11')]],
        [{ workflow_runs: [run(11, { displayTitle: runTitle({ sha: currentHead }) })] }],
        currentHead,
        '12',
      ),
    ).toEqual({ base: currentHead, unsafe: [] })
  })

  it('rejects a lower production promotion before its runner starts', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const checkpoint = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [[status(checkpoint, '10')]],
        [
          {
            workflow_runs: [run(10, { displayTitle: runTitle({ sha: checkpoint }) }), run(11)],
          },
        ],
        currentHead,
        '12',
      ),
    ).toEqual({ base: checkpoint, unsafe: ['11'] })
  })
  it('rejects an uncheckpointed production run but ignores previews and manual runs', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const checkpoint = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [[status(checkpoint, '10')]],
        [
          {
            workflow_runs: [
              run(10, { displayTitle: runTitle({ sha: checkpoint }) }),
              run(11),
              run(12, { displayTitle: runTitle({ environment: 'preview' }) }),
              run(13, { event: 'workflow_dispatch' }),
            ],
          },
        ],
        currentHead,
        '14',
      ),
    ).toEqual({ base: checkpoint, unsafe: ['11'] })
  })

  it('treats a lower run missing from the API snapshot as unsafe', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const checkpoint = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [[status(checkpoint, '10')]],
        [{ workflow_runs: [run(10, { displayTitle: runTitle({ sha: checkpoint }) })] }],
        currentHead,
        '12',
      ),
    ).toEqual({ base: checkpoint, unsafe: ['11'] })
  })

  it('rejects a purge marker that does not match its run title', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const checkpoint = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'

    expect(
      selectPurgeState(
        [[status(checkpoint, '10')]],
        [{ workflow_runs: [run(10)] }],
        currentHead,
        '11',
      ),
    ).toEqual({ base: null, unsafe: [] })
  })

  it('ignores failed, malformed, and future purge markers', () => {
    const currentHead = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

    expect(
      selectPurgeState(
        [
          [
            status('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '10', 'failure'),
            status('not-a-sha', '11'),
            status('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'not-a-run'),
            status('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '13'),
          ],
        ],
        [{ workflow_runs: [] }],
        currentHead,
        '12',
      ),
    ).toEqual({ base: null, unsafe: [] })
  })
})
