import { join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { runTranslation } from '../lib/i18n/run'
import { createOpenRouterModel } from '../lib/i18n/engine'
import { TARGET_LOCALES } from '../lib/i18n/config'
import { progress } from '../lib/i18n/progress'

const CACHE_DIR = join(process.cwd(), 'content/.i18n-cache')
const STATE_FILE = join(CACHE_DIR, 'state.json')

/**
 * Errors that mean the run failed for an account-level reason rather than a
 * content one: no amount of retrying or re-running fixes them, and every affected
 * file is silently left in English. The workflow must go red on these — the
 * pipeline once sat dead for three weeks emitting green "success" runs because a
 * spend-limited key skipped every file.
 */
const FATAL_SKIP_RE =
  /requires more credits|insufficient|quota|billing|payment|invalid api key|no auth credentials|unauthor|forbidden|\b40[13]\b/i

/** Above this share of file×locale pairs failing, the run is broken, not degraded. */
const MAX_SKIP_RATE = Number(process.env.TRANSLATE_MAX_SKIP_RATE) || 0.25

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit?.split('=').slice(1).join('=')
}

/**
 * Persist what the next run needs in order to decide whether it has any work to
 * do. It lives in the cache directory so it rides along in the Actions cache with
 * the translation memory. `complete` is written false up front so a crash mid-run
 * can never leave a stale "nothing pending" behind for the workflow's skip check.
 */
async function writeState(state: {
  complete: boolean
  pending?: number
  attempted?: number
}): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`)
}

async function main() {
  const force = process.argv.includes('--force')
  const dryRun = process.argv.includes('--dry-run')
  const localesArg = arg('locales')
  const locales = localesArg?.split(',') ?? [...TARGET_LOCALES]
  const only = arg('only') ?? null

  if (!dryRun && !process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set')
    process.exit(1)
  }

  // Auto-detect: live dashboard in an interactive terminal, periodic heartbeat
  // lines under CI (no TTY). A dry run does no API work, so keep it quiet.
  progress.configure(dryRun ? 'silent' : undefined)

  // A partial run (--only/--locales) says nothing about whether the whole docs set
  // is converged, so it must not write the state that the skip check reads.
  const tracksState = !dryRun && !only && !localesArg
  if (tracksState) await writeState({ complete: false })

  const stats = await runTranslation({
    contentDir: join(process.cwd(), 'content/docs'),
    cacheDir: CACHE_DIR,
    locales,
    model: createOpenRouterModel(),
    force,
    dryRun,
    only,
  })

  console.log(
    `[translate] locales=${locales.join(',')} translated=${stats.translatedBlocks} cached=${stats.cachedBlocks} skipped=${stats.skipped.length}/${stats.attempted} quarantined=${stats.quarantined.length}`,
  )
  for (const s of stats.skipped) console.warn(`[translate] skipped ${s}`)
  // Not counted as pending: these are settled (the page serves English until its
  // source changes), so they must not keep every scheduled sweep doing a full pass.
  for (const q of stats.quarantined) console.warn(`[translate] quarantined ${q}`)

  if (tracksState) {
    await writeState({ complete: true, pending: stats.skipped.length, attempted: stats.attempted })
  }

  const fatal = stats.skipped.filter((s) => FATAL_SKIP_RE.test(s))
  if (fatal.length > 0) {
    console.error(
      `[translate] ${fatal.length} file(s) failed for an account-level reason (credits, quota, or auth). First: ${fatal[0]}`,
    )
    process.exit(1)
  }

  const skipRate = stats.attempted > 0 ? stats.skipped.length / stats.attempted : 0
  if (skipRate > MAX_SKIP_RATE) {
    console.error(
      `[translate] ${stats.skipped.length}/${stats.attempted} file translations failed (${Math.round(skipRate * 100)}%, limit ${Math.round(MAX_SKIP_RATE * 100)}%)`,
    )
    process.exit(1)
  }
}

main().catch((e) => {
  // Tear down the live display (stop the timer, restore the cursor) before the
  // error prints, so a crash mid-run doesn't leave the terminal in a bad state.
  progress.end()
  console.error(e)
  process.exit(1)
})
