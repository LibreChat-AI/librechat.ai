import { readFile, writeFile, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import pLimit from 'p-limit'
import GithubSlugger from 'github-slugger'
import {
  segmentMarkdown,
  reassemble,
  hashText,
  extractMetaStrings,
  rebuildMeta,
  isHeading,
  headingHasExplicitId,
  headingSlugText,
  unescapeJsString,
  escapeJsString,
  type Segment,
} from './segment'
import { validateTranslation } from './validate'
import { translate, type TranslateModel } from './engine'
import { TM } from './tm'
import { TARGET_LOCALES } from './config'
import { progress } from './progress'

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

// How many files translate at once. Lower it (TRANSLATE_CONCURRENCY) to ease
// rate-limit pressure when bootstrapping a brand-new locale from scratch.
const FILE_CONCURRENCY = Number(process.env.TRANSLATE_CONCURRENCY) || 6
// How many times to re-drive files that failed transiently within a single run,
// so a burst of provider/rate-limit errors converges instead of requiring the
// whole workflow to be re-run by hand.
const MAX_FILE_ROUNDS = Number(process.env.TRANSLATE_FILE_ROUNDS) || 3
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

  progress.begin({ locales: opts.locales, filesPerLocale: filtered.length, stats })
  for (const locale of opts.locales) {
    progress.startLocale(locale)
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
      // A model that returns nothing (refusal / reasoning-only finish) must not be
      // cached or written as an empty block — treat it as a failure for this file.
      if (result.trim() === '' && text.trim() !== '') {
        throw new Error(`empty model output for a ${kind} block`)
      }
      staged.set(hash, result)
      stats.translatedBlocks++
      return result
    }

    // Records the last transient error per file so it can be reported only if the
    // file never succeeds across every retry round.
    const lastTransientError = new Map<string, string>()

    // Translate one source file. Returns:
    //   'ok'        — written (or a no-op dry run)
    //   'skip'      — deterministic failure (broken output removed; retried next run)
    //   'transient' — recoverable failure (provider/network/rate-limit/empty
    //                 response); retried in-run by the round loop below.
    const processFile = (rel: string): Promise<'ok' | 'skip' | 'transient'> =>
      limit(async () => {
        const abs = join(opts.contentDir, rel)
        const staged = new Map<string, string>()
        try {
          if (rel.endsWith('meta.json')) {
            const meta = JSON.parse(await readFile(abs, 'utf8'))
            const map = new Map<string, string>()
            for (const s of extractMetaStrings(meta))
              map.set(s, await translateString(staged, s, 'inline'))
            if (opts.dryRun) return 'ok'
            const out = rebuildMeta(meta, (s) => map.get(s) ?? s)
            await writeFile(
              join(opts.contentDir, localePath(rel, locale, '.json')),
              `${JSON.stringify(out, null, 2)}\n`,
            )
            for (const [h, v] of staged) tm.set(h, v)
            return 'ok'
          }

          const source = await readFile(abs, 'utf8')
          const parsed = matter(source)
          const segs = segmentMarkdown(parsed.content)
          // Pin translated heading ids to the English slug so same-page #anchor
          // links keep resolving (Fumadocs would otherwise regenerate the id from
          // the translated text). Slug in document order to match its github-slugger.
          const slugger = new GithubSlugger()
          const naiveSlug = (s: string) => new GithubSlugger().slug(s)
          const outSegs: { text: string }[] = []
          for (let i = 0; i < segs.length; i++) {
            const seg = segs[i]
            if (seg.kind === 'verbatim') {
              // Advance the slugger over verbatim (identifier/code) headings too,
              // in document order, so the suffixes it assigns to pinned headings
              // match Fumadocs on the English page. Pin a verbatim heading only
              // when it actually collides: otherwise its natural slug already
              // equals English, and pinning every identifier heading adds noise.
              if (isHeading(seg.text) && !headingHasExplicitId(seg.text)) {
                const base = headingSlugText(seg.text)
                const id = slugger.slug(base)
                outSegs.push({
                  text:
                    id === naiveSlug(base) ? seg.text : `${seg.text.replace(/\s+$/, '')} [#${id}]`,
                })
              } else {
                outSegs.push({ text: seg.text })
              }
              continue
            }
            // Values from quoted JS/JSX string literals: translate the unescaped
            // text, then re-escape for the enclosing quote so a natural apostrophe
            // in the translation can't break the generated MDX.
            if (seg.jsQuote) {
              const clean = unescapeJsString(seg.text, seg.jsQuote)
              const t = await translateString(staged, clean, 'inline', neighborContext(segs, i))
              outSegs.push({ text: escapeJsString(t, seg.jsQuote) })
              continue
            }
            let text = await translateString(staged, seg.text, 'block', neighborContext(segs, i))
            if (isHeading(seg.text) && !headingHasExplicitId(seg.text)) {
              const id = slugger.slug(headingSlugText(seg.text))
              // Trim any trailing whitespace the model added before appending the
              // id, so `[#id]` terminates the heading line. Fumadocs only attaches
              // a custom id when it ends the heading text; a trailing newline would
              // push it onto the next line and silently drop the anchor.
              if (!headingHasExplicitId(text)) text = `${text.replace(/\s+$/, '')} [#${id}]`
            }
            outSegs.push({ text })
          }
          const outData: Record<string, unknown> = { ...parsed.data }
          for (const key of ['title', 'description']) {
            const val = parsed.data[key]
            if (typeof val === 'string' && /\p{L}/u.test(val))
              outData[key] = await translateString(staged, val, 'inline')
          }
          if (opts.dryRun) {
            stats.files++
            return 'ok'
          }
          const output = matter.stringify(reassemble(outSegs), outData)
          const check = validateTranslation(source, output)
          if (!check.ok) {
            stats.skipped.push(`${rel} [${locale}]: ${check.error}`)
            // Remove any previously-written locale file so the page falls back to
            // fresh English instead of serving a stale translation that predates
            // the source change. It is retried (uncached) on the next run.
            await unlink(join(opts.contentDir, localePath(rel, locale, '.mdx'))).catch(() => {})
            return 'skip'
          }
          await writeFile(join(opts.contentDir, localePath(rel, locale, '.mdx')), output)
          for (const [h, v] of staged) tm.set(h, v)
          stats.files++
          return 'ok'
        } catch (e) {
          // A transient failure (a provider/network/rate-limit error, an empty
          // model response, an I/O error, or an uncached block under --force /
          // after a prompt-version bump). It must NOT delete the existing
          // translation — a provider blip committed as data loss — so the previous
          // locale file is kept. The round loop below re-drives this file within
          // the same run; only if it still fails after every round is it reported
          // as skipped. (A successful-but-structurally-broken translation is
          // removed deliberately by the validateTranslation path above.)
          lastTransientError.set(rel, (e as Error).message)
          return 'transient'
        }
      })

    // Translate every file, then re-drive the ones that failed transiently until
    // they succeed or the round budget is exhausted. The per-call backoff lives in
    // the model (retry.withRetry); these rounds give a file whose retry budget was
    // exhausted a fresh attempt, so one workflow run converges rather than leaving
    // most pages untranslated for a manual re-run.
    // Count each file's terminal completion exactly once for the progress UI: a
    // file may resolve 'transient' in one round and 'ok'/'skip' in a later one.
    const counted = new Set<string>()
    let pending = filtered
    for (let round = 0; ; round++) {
      const results = await Promise.all(
        pending.map(async (rel) => [rel, await processFile(rel)] as const),
      )
      for (const [rel, r] of results)
        if (r !== 'transient' && !counted.has(rel)) {
          counted.add(rel)
          progress.fileDone(locale)
        }
      const transient = results.filter(([, r]) => r === 'transient').map(([rel]) => rel)
      if (transient.length === 0 || round >= MAX_FILE_ROUNDS) {
        for (const rel of transient) {
          if (!counted.has(rel)) {
            counted.add(rel)
            progress.fileDone(locale)
          }
          stats.skipped.push(
            `${rel} [${locale}]: ${lastTransientError.get(rel) ?? 'transient failure'}`,
          )
        }
        break
      }
      progress.note(
        `${locale}: retrying ${transient.length} transiently-failed file(s) (round ${round + 1}/${MAX_FILE_ROUNDS})`,
      )
      pending = transient
    }

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
    progress.finishLocale(locale)
  }

  progress.end()
  return stats
}
