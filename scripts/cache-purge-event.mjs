import { appendFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const VERCEL_PROJECT_ID = 'prj_BM0YCOihInl5lqPJidAzwixJPdtj'

const COMMIT_SHA = /^[0-9a-f]{40}$/u
const DEPLOYMENT_ID = /^dpl_[A-Za-z0-9]+$/u
const GIT_REF = /^(?!.*(?:^|\/)\.)(?!.*\.\.)(?!.*\/$)[A-Za-z0-9][A-Za-z0-9._/-]*$/u
const PURGE_LEDGER_DESCRIPTION = /^([1-9]\d*)\|([0-9a-f]{40})\|/u
const RUN_TITLE = /^cache-purge:([^:]+):([^:]+):([^:]+):([0-9a-f]{40}):(dpl_[A-Za-z0-9]+)$/u

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
  if (!GIT_REF.test(payload.git?.ref ?? '')) {
    throw new Error(`Vercel event has an invalid Git ref: ${payload.git?.ref ?? 'missing'}`)
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
    ref: payload.git.ref,
  }
}

function parseCachePurgeRunTitle(value) {
  if (typeof value !== 'string') return null
  const match = value.match(RUN_TITLE)
  if (!match) return null
  return {
    environment: match[1],
    projectId: match[2],
    ref: match[3],
    sha: match[4],
    deploymentId: match[5],
  }
}

/**
 * Finds the latest known-good purge checkpoint and proves that no workflow run
 * between it and the current event can hide an unpurged production transition.
 *
 * `run-name` is evaluated when GitHub creates a run, before a runner starts,
 * and the REST API exposes it as `display_title`. It carries the immutable
 * Vercel routing fields even for queued, failed, or cancelled runs. A current
 * project production run after the checkpoint is therefore unsafe to skip;
 * previews and manual recovery runs do not change this production history.
 */
export function selectPurgeState(
  statusPages,
  workflowRunPages,
  currentHead,
  currentRunNumber,
  purgeContextPrefix = 'cache-purge',
) {
  if (!COMMIT_SHA.test(currentHead)) {
    throw new Error(`Current head is not a valid Git commit SHA: ${currentHead}`)
  }
  if (!/^[1-9]\d*$/u.test(currentRunNumber)) {
    throw new Error(`Current run number is invalid: ${currentRunNumber}`)
  }

  const currentRun = BigInt(currentRunNumber)
  const runsByNumber = new Map()
  for (const page of Array.isArray(workflowRunPages) ? workflowRunPages : []) {
    for (const run of Array.isArray(page?.workflow_runs) ? page.workflow_runs : []) {
      if (!/^[1-9]\d*$/u.test(String(run?.run_number ?? ''))) continue
      const runNumber = BigInt(run.run_number)
      if (runNumber >= currentRun) continue
      runsByNumber.set(String(runNumber), run)
    }
  }

  const purgeContext = `${purgeContextPrefix}/`
  let checkpoint
  for (const status of Array.isArray(statusPages) ? statusPages.flat() : []) {
    if (
      !status ||
      typeof status !== 'object' ||
      status.state !== 'success' ||
      typeof status.context !== 'string' ||
      !status.context.startsWith(purgeContext) ||
      typeof status.description !== 'string'
    ) {
      continue
    }

    const deploymentId = status.context.slice(purgeContext.length)
    const marker = status.description.match(PURGE_LEDGER_DESCRIPTION)
    if (!DEPLOYMENT_ID.test(deploymentId) || !marker) continue

    const entry = {
      deploymentId,
      runNumber: BigInt(marker[1]),
      sha: marker[2],
    }
    if (entry.runNumber >= currentRun) continue

    const run = runsByNumber.get(String(entry.runNumber))
    const metadata = parseCachePurgeRunTitle(run?.display_title)
    if (
      run?.event !== 'repository_dispatch' ||
      metadata?.environment !== 'production' ||
      metadata.projectId !== VERCEL_PROJECT_ID ||
      metadata.sha !== entry.sha ||
      metadata.deploymentId !== entry.deploymentId
    ) {
      continue
    }
    if (!checkpoint || entry.runNumber > checkpoint.runNumber) {
      checkpoint = entry
    }
  }

  if (!checkpoint) {
    return { base: null, unsafe: [] }
  }

  const unsafe = []
  for (let runNumber = checkpoint.runNumber + 1n; runNumber < currentRun; runNumber += 1n) {
    const key = String(runNumber)
    const run = runsByNumber.get(key)
    if (!run) {
      unsafe.push(key)
      continue
    }
    if (run.event === 'workflow_dispatch') continue
    if (run.event !== 'repository_dispatch') {
      unsafe.push(key)
      continue
    }

    const metadata = parseCachePurgeRunTitle(run.display_title)
    if (!metadata) {
      unsafe.push(key)
      continue
    }
    if (metadata.environment !== 'production' || metadata.projectId !== VERCEL_PROJECT_ID) {
      continue
    }

    // The normal production branch and a manually promoted non-main deployment
    // both changed what the zone served. The current job validates main events;
    // either kind is a chronology hole until a successful purge checkpoints it.
    unsafe.push(key)
  }

  return {
    base: checkpoint.sha,
    unsafe,
  }
}

function main() {
  if (process.argv[2] === 'baseline') {
    const [, , , statusFile, workflowRunsFile, currentHead, currentRunNumber, purgeContextPrefix] =
      process.argv
    if (!statusFile || !workflowRunsFile || !currentHead || !currentRunNumber) {
      throw new Error(
        'baseline requires <status-file> <workflow-runs-file> <current-head> <current-run-number> [purge-context]',
      )
    }
    const statusPages = JSON.parse(readFileSync(statusFile, 'utf8'))
    const workflowRunPages = JSON.parse(readFileSync(workflowRunsFile, 'utf8'))
    const state = selectPurgeState(
      statusPages,
      workflowRunPages,
      currentHead,
      currentRunNumber,
      purgeContextPrefix,
    )
    process.stdout.write(`${JSON.stringify(state)}\n`)
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
  appendFileSync(
    output,
    `deployment_id=${event.deploymentId}\nhead=${event.head}\nref=${event.ref}\n`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`::error::${error.message}\n`)
    process.exitCode = 1
  }
}
