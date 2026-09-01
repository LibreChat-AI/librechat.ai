import { describe, expect, it } from 'vitest'
import { VERCEL_PROJECT_ID, validatePromotedDeployment } from './cache-purge-event.mjs'

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
