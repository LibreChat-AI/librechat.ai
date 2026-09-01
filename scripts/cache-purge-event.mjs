import { appendFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const VERCEL_PROJECT_ID = 'prj_BM0YCOihInl5lqPJidAzwixJPdtj'

const COMMIT_SHA = /^[0-9a-f]{40}$/u
const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9]+$/u
const PURGE_LEDGER_DESCRIPTION = /^([1-9]\d*)\|([0-9a-f]{40})\|/u

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
  if (payload.git?.ref !== 'main') {
    throw new Error(`Vercel event is not the production branch: ${payload.git?.ref ?? 'missing'}`)
  }
  if (!COMMIT_SHA.test(payload.git?.sha ?? '')) {
    throw new Error(`Vercel event has an invalid Git commit SHA: ${payload.git?.sha ?? 'missing'}`)
  }
  if (!DEPLOYMENT_ID.test(payload.id ?? '')) {
    throw new Error(`Vercel event has an invalid Vercel deployment ID: ${payload.id ?? 'missing'}`)
  }

  return {
    deploymentId: payload.id,
    head: payload.git.sha,
  }
}

/**
 * Selects the latest successful promotion that differs from the commit
 * currently being promoted. GitHub assigns `run_number` when each workflow run
 * is created and keeps it stable on reruns, so it preserves event order even
 * when overlapping purges finish in the opposite order.
 */
export function selectPreviousPurgedCommit(
  statusPages,
  currentHead,
  contextPrefix = 'cache-purge',
) {
  if (!COMMIT_SHA.test(currentHead)) {
    throw new Error(`Current head is not a valid Git commit SHA: ${currentHead}`)
  }

  const deploymentContext = `${contextPrefix}/dpl_`
  const deployments = []
  for (const status of Array.isArray(statusPages) ? statusPages.flat() : []) {
    if (
      !status ||
      typeof status !== 'object' ||
      status.state !== 'success' ||
      typeof status.context !== 'string' ||
      !status.context.startsWith(deploymentContext) ||
      typeof status.description !== 'string'
    ) {
      continue
    }

    const marker = status.description.match(PURGE_LEDGER_DESCRIPTION)
    if (!marker || marker[2] === currentHead) continue
    deployments.push({
      runNumber: BigInt(marker[1]),
      sha: marker[2],
    })
  }

  deployments.sort((left, right) => {
    if (left.runNumber === right.runNumber) return 0
    return left.runNumber > right.runNumber ? -1 : 1
  })
  return deployments[0]?.sha ?? null
}

function main() {
  if (process.argv[2] === 'baseline') {
    const [, , , statusFile, currentHead, contextPrefix] = process.argv
    if (!statusFile || !currentHead) {
      throw new Error('baseline requires <status-file> <current-head> [context-prefix]')
    }
    const statusPages = JSON.parse(readFileSync(statusFile, 'utf8'))
    const base = selectPreviousPurgedCommit(statusPages, currentHead, contextPrefix)
    if (base) process.stdout.write(`${base}\n`)
    return
  }

  const output = process.env.GITHUB_OUTPUT
  if (!output) throw new Error('GITHUB_OUTPUT is required')

  let payload
  try {
    payload = JSON.parse(process.env.CLIENT_PAYLOAD ?? '')
  } catch {
    throw new Error('CLIENT_PAYLOAD is not valid JSON')
  }

  const event = validatePromotedDeployment(payload)
  appendFileSync(output, `deployment_id=${event.deploymentId}\nhead=${event.head}\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`::error::${error.message}\n`)
    process.exitCode = 1
  }
}
