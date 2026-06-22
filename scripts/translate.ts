import { join } from 'node:path'
import { runTranslation } from '../lib/i18n/run'
import { createOpenRouterModel } from '../lib/i18n/engine'
import { TARGET_LOCALES } from '../lib/i18n/config'
import { progress } from '../lib/i18n/progress'

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit?.split('=').slice(1).join('=')
}

async function main() {
  const force = process.argv.includes('--force')
  const dryRun = process.argv.includes('--dry-run')
  const locales = arg('locales')?.split(',') ?? [...TARGET_LOCALES]
  const only = arg('only') ?? null

  if (!dryRun && !process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is not set')
    process.exit(1)
  }

  // Auto-detect: live dashboard in an interactive terminal, periodic heartbeat
  // lines under CI (no TTY). A dry run does no API work, so keep it quiet.
  progress.configure(dryRun ? 'silent' : undefined)

  const stats = await runTranslation({
    contentDir: join(process.cwd(), 'content/docs'),
    cacheDir: join(process.cwd(), 'content/.i18n-cache'),
    locales,
    model: createOpenRouterModel(),
    force,
    dryRun,
    only,
  })

  console.log(
    `[translate] locales=${locales.join(',')} translated=${stats.translatedBlocks} cached=${stats.cachedBlocks} skipped=${stats.skipped.length}`,
  )
  for (const s of stats.skipped) console.warn(`[translate] skipped ${s}`)
}

main().catch((e) => {
  // Tear down the live display (stop the timer, restore the cursor) before the
  // error prints, so a crash mid-run doesn't leave the terminal in a bad state.
  progress.end()
  console.error(e)
  process.exit(1)
})
