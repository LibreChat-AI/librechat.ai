import { appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const VERCEL_PROJECT_ID = 'prj_BM0YCOihInl5lqPJidAzwixJPdtj'

const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9]+$/u

/**
 * Validates the enriched payload Vercel sends with
 * `vercel.deployment.promoted`. The workflow filters the same fields before
 * allocating a runner; this is the credential-boundary check before it reaches
 * Cloudflare secrets.
 */
export function validatePromotedDeployment(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Vercel promoted payload is missing')
  }
  if (payload.environment !== 'production') {
    throw new Error('Vercel event is not a production deployment')
  }
  if (payload.project?.id !== VERCEL_PROJECT_ID) {
    throw new Error(
      `Vercel event has an unexpected Vercel project: ${payload.project?.id ?? 'missing'}`,
    )
  }
  if (!DEPLOYMENT_ID.test(payload.id ?? '')) {
    throw new Error(`Vercel event has an invalid Vercel deployment ID: ${payload.id ?? 'missing'}`)
  }

  return {
    deploymentId: payload.id,
  }
}

function main() {
  const output = process.env.GITHUB_OUTPUT
  if (!output) throw new Error('GITHUB_OUTPUT is required')

  let payload
  try {
    payload = JSON.parse(process.env.CLIENT_PAYLOAD ?? '')
  } catch {
    throw new Error('CLIENT_PAYLOAD is not valid JSON')
  }

  const event = validatePromotedDeployment(payload)
  appendFileSync(output, `deployment_id=${event.deploymentId}\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`::error::${error.message}\n`)
    process.exitCode = 1
  }
}
