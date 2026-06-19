import { readFile, writeFile, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import pLimit from 'p-limit'
import {
  segmentMarkdown,
  reassemble,
  hashText,
  extractMetaStrings,
  rebuildMeta,
  type Segment,
} from './segment'
import { validateTranslation } from './validate'
import { translate, type TranslateModel } from './engine'
import { TM } from './tm'
import { TARGET_LOCALES } from './config'

export interface RunOptions {
  contentDir: string
  cacheDir: string
  locales: string[]
  model: TranslateModel
  force?: boolean
  dryRun?: boolean
  only?: string | null
}

export interface RunStats {
  files: number
  translatedBlocks: number
  cachedBlocks: number
  skipped: string[]
}

const FILE_CONCURRENCY = 6
const LOCALE_ALT = TARGET_LOCALES.join('|')
const LOCALE_RE = new RegExp(`\\.(${LOCALE_ALT})\\.mdx$`)
const META_LOCALE_RE = new RegExp(`^meta\\.(${LOCALE_ALT})\\.json$`)

/** Recursively list files under dir, returning paths relative to dir. */
async function walk(dir: string, base = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const out: string[] = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '.i18n-cache') continue
      out.push(...(await walk(full, base)))
    } else {
      out.push(full.slice(base.length + 1))
    }
  }
  return out
}

function localePath(rel: string, locale: string, ext: string): string {
  return `${rel.slice(0, -ext.length)}.${locale}${ext}`
}

function neighborContext(segments: Segment[], index: number): string {
  const texts: string[] = []
  for (let i = index - 1; i <= index + 1; i++) {
    if (i === index) continue
    const s = segments[i]
    if (s?.kind === 'translatable') texts.push(s.text)
  }
  return texts.join('\n\n').slice(0, 1200)
}

export async function runTranslation(opts: RunOptions): Promise<RunStats> {
  const stats: RunStats = { files: 0, translatedBlocks: 0, cachedBlocks: 0, skipped: [] }
  const all = await walk(opts.contentDir)
  const sources = all.filter(
    (f) =>
      (f.endsWith('.mdx') && !LOCALE_RE.test(f)) ||
      (f.endsWith('meta.json') && !META_LOCALE_RE.test(f.split('/').at(-1) ?? '')),
  )
  const filtered = opts.only ? sources.filter((f) => f.includes(opts.only!)) : sources

  for (const locale of opts.locales) {
    const tm = await TM.load(locale, opts.cacheDir)
    const limit = pLimit(FILE_CONCURRENCY)

    // `staged` holds a single file's new translations; they are committed to the
    // TM only after that file validates, so a broken page is never cached.
    const translateString = async (
      staged: Map<string, string>,
      text: string,
      kind: 'block' | 'inline',
      context?: string,
    ): Promise<string> => {
      const hash = hashText(text)
      tm.markUsed(hash)
      const cached = opts.force ? undefined : tm.get(hash)
      if (cached !== undefined) {
        stats.cachedBlocks++
        return cached
      }
      const pending = staged.get(hash)
      if (pending !== undefined) {
        stats.cachedBlocks++
        return pending
      }
      if (opts.dryRun) {
        stats.translatedBlocks++
        return text
      }
      const result = await translate({ text, locale, kind, context, model: opts.model })
      staged.set(hash, result)
      stats.translatedBlocks++
      return result
    }

    await Promise.all(
      filtered.map((rel) =>
        limit(async () => {
          const abs = join(opts.contentDir, rel)
          const staged = new Map<string, string>()
          if (rel.endsWith('meta.json')) {
            const meta = JSON.parse(await readFile(abs, 'utf8'))
            const map = new Map<string, string>()
            for (const s of extractMetaStrings(meta)) map.set(s, await translateString(staged, s, 'inline'))
            if (opts.dryRun) return
            const out = rebuildMeta(meta, (s) => map.get(s) ?? s)
            await writeFile(
              join(opts.contentDir, localePath(rel, locale, '.json')),
              `${JSON.stringify(out, null, 2)}\n`,
            )
            for (const [h, v] of staged) tm.set(h, v)
            return
          }

          const source = await readFile(abs, 'utf8')
          const parsed = matter(source)
          const segs = segmentMarkdown(parsed.content)
          const outSegs: { text: string }[] = []
          for (let i = 0; i < segs.length; i++) {
            const seg = segs[i]
            if (seg.kind === 'verbatim') outSegs.push({ text: seg.text })
            else
              outSegs.push({
                text: await translateString(staged, seg.text, 'block', neighborContext(segs, i)),
              })
          }
          const outData: Record<string, unknown> = { ...parsed.data }
          for (const key of ['title', 'description']) {
            const val = parsed.data[key]
            if (typeof val === 'string' && /\p{L}/u.test(val))
              outData[key] = await translateString(staged, val, 'inline')
          }
          if (opts.dryRun) {
            stats.files++
            return
          }
          const output = matter.stringify(reassemble(outSegs), outData)
          const check = validateTranslation(source, output)
          if (!check.ok) {
            stats.skipped.push(`${rel} [${locale}]: ${check.error}`)
            return
          }
          await writeFile(join(opts.contentDir, localePath(rel, locale, '.mdx')), output)
          for (const [h, v] of staged) tm.set(h, v)
          stats.files++
        }),
      ),
    )

    // Orphan cleanup + cache GC only on full runs.
    if (!opts.only && !opts.dryRun) {
      const sourceSet = new Set(sources)
      for (const f of all) {
        const name = f.split('/').at(-1) ?? ''
        const isThisLocale =
          (f.endsWith(`.${locale}.mdx`) && LOCALE_RE.test(f)) || name === `meta.${locale}.json`
        if (!isThisLocale) continue
        const dir = f.slice(0, f.lastIndexOf('/') + 1)
        const baseRel = name.startsWith('meta.')
          ? `${dir}meta.json`
          : `${dir}${name.replace(`.${locale}.mdx`, '.mdx')}`
        if (!sourceSet.has(baseRel)) await unlink(join(opts.contentDir, f))
      }
      tm.prune()
    }

    if (!opts.dryRun) await tm.save()
  }

  return stats
}
