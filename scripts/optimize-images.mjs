// @ts-check
/**
 * Re-compresses raster images in `public/` in place using sharp.
 *
 * Why: many committed screenshots and social cards were exported at 2-3x their
 * displayed size (e.g. a 2500x1375 OG card weighing 3.3 MB). This pass caps
 * oversized dimensions (retina-safe), re-encodes PNG/JPEG with modern settings,
 * and resizes Open Graph social cards to the canonical 1200x630, all while
 * keeping the original filenames so no `<img>`/MDX references break.
 *
 * Usage:
 *   pnpm optimize:images          # optimize in place
 *   pnpm optimize:images --check  # dry run, report potential savings only
 */
import sharp from 'sharp'
import { readdir, stat, rename, unlink, writeFile } from 'node:fs/promises'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC_DIR = join(ROOT, 'public')

/** Cap the longest edge of a regular image. 2000px keeps 2x retina for any
 *  content rendered up to 1000px wide (the docs/blog column). */
const MAX_EDGE = 2000
/** Open Graph cards have a fixed canonical size. */
const OG_CARD = { width: 1200, height: 630 }
/** Files smaller than this are left untouched. */
const MIN_BYTES = 20 * 1024

const DRY_RUN = process.argv.includes('--check')

/** Directories (relative to public/) whose images are Open Graph cards. */
const OG_CARD_DIRS = ['images/socialcards']

/** Write the already-encoded bytes to a temp file, then atomically rename over
 *  the original. We must NOT re-run the buffer through sharp here, or it would
 *  re-encode with default settings and undo the optimization. */
async function writeAtomic(buffer, targetPath) {
  const tmp = `${targetPath}.opt.tmp`
  try {
    await writeFile(tmp, buffer)
    await rename(tmp, targetPath)
  } catch (err) {
    await unlink(tmp).catch(() => {})
    throw err
  }
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

function formatBytes(n) {
  if (Math.abs(n) >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`
  return `${(n / 1024).toFixed(0)} KB`
}

async function optimize(file) {
  const ext = extname(file).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null

  const before = (await stat(file)).size
  if (before < MIN_BYTES) return null

  const rel = relative(PUBLIC_DIR, file).replaceAll('\\', '/')
  const isOgCard = OG_CARD_DIRS.some((d) => rel.startsWith(`${d}/`))

  const input = sharp(file, { failOn: 'none' })
  const meta = await input.metadata()

  let pipeline = sharp(await input.toBuffer(), { failOn: 'none' }).rotate()

  if (isOgCard) {
    pipeline = pipeline.resize(OG_CARD.width, OG_CARD.height, { fit: 'cover' })
  } else if ((meta.width ?? 0) > MAX_EDGE || (meta.height ?? 0) > MAX_EDGE) {
    pipeline = pipeline.resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
  }

  if (ext === '.png') {
    pipeline = pipeline.png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true })
  }

  const optimized = await pipeline.toBuffer()
  // Keep the original if re-encoding didn't actually help.
  if (optimized.length >= before) return { rel, before, after: before, saved: 0 }

  if (!DRY_RUN) await writeAtomic(optimized, file)
  return { rel, before, after: optimized.length, saved: before - optimized.length }
}

async function main() {
  const results = []
  for await (const file of walk(PUBLIC_DIR)) {
    try {
      const r = await optimize(file)
      if (r && r.saved > 0) results.push(r)
    } catch (err) {
      console.error(`skip ${file}: ${err.message}`)
    }
  }

  results.sort((a, b) => b.saved - a.saved)
  const totalSaved = results.reduce((s, r) => s + r.saved, 0)
  const totalBefore = results.reduce((s, r) => s + r.before, 0)

  for (const r of results.slice(0, 25)) {
    console.log(
      `${formatBytes(r.before).padStart(9)} -> ${formatBytes(r.after).padStart(9)}  ${r.rel}`,
    )
  }
  console.log('-'.repeat(60))
  console.log(
    `${DRY_RUN ? '[dry run] ' : ''}${results.length} images, ` +
      `${formatBytes(totalBefore)} -> ${formatBytes(totalBefore - totalSaved)} ` +
      `(saved ${formatBytes(totalSaved)}, ${((totalSaved / totalBefore) * 100).toFixed(0)}%)`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
