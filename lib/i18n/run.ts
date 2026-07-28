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
import { validatePreservedText, validateTranslation } from './validate'
import { translate, type TranslateModel } from './engine'
import { TM } from './tm'
import { TARGET_LOCALES, VALIDATOR_VERSION } from './config'
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
  /** Source files × locales this run set out to produce, so a caller can judge a
   *  skip count as a failure rate rather than an absolute number. */
  attempted: number
  skipped: string[]
  /**
   * Files left in English because they failed validation too many times in a row.
   * Reported separately from `skipped`: they are a settled outcome, not work still
   * outstanding, so they must not keep the pipeline looking unconverged forever.
   */
  quarantined: string[]
}

// How many files translate at once. Lower it (TRANSLATE_CONCURRENCY) to ease
// rate-limit pressure when bootstrapping a brand-new locale from scratch.
const FILE_CONCURRENCY = Number(process.env.TRANSLATE_CONCURRENCY) || 6
// How many times to re-drive files that failed transiently within a single run,
// so a burst of provider/rate-limit errors converges instead of requiring the
// whole workflow to be re-run by hand.
const MAX_FILE_ROUNDS = Number(process.env.TRANSLATE_FILE_ROUNDS) || 3
// A single corrupted block should not doom a long page after hundreds of other
// blocks translated correctly. Retry preservation failures locally; if the model
// still changes protected tokens, keep that one block in English and let the page
// publish with the remaining translated content.
const BLOCK_VALIDATION_ATTEMPTS = Number(process.env.TRANSLATE_BLOCK_VALIDATION_ATTEMPTS) || 3
/**
 * Cache key for a block the model could not translate without mangling protected
 * tokens. Namespaced by VALIDATOR_VERSION and stored alongside the translations in
 * the same per-locale file; the value is empty because the marker itself is the
 * information ("keep the English source for this block").
 *
 * Without it, every such block costs BLOCK_VALIDATION_ATTEMPTS model calls on every
 * single run forever: the fallback returns the source text but caches nothing, so
 * the next run misses again. Across 13 locales and a half-hourly schedule that was
 * the bulk of the pipeline's spend while `translated=0`.
 *
 * Scoped by `kind`: the same source string can appear both as a Markdown block and
 * as an inline title or label, and the two use different prompts and different
 * validators. A block that keeps failing must not stop the inline occurrence from
 * ever being attempted, since that one may well succeed.
 */
const giveUpKey = (hash: string, kind: 'block' | 'inline'): string =>
  `giveup:${VALIDATOR_VERSION}:${kind}:${hash}`
const isGiveUpKey = (key: string): boolean => key.startsWith('giveup:')

/**
 * How many times one file may fail whole-file validation before it is left in
 * English instead of being re-translated on every run. The failure is
 * deterministic (the same source produced structurally broken output), and each
 * retry re-translates every block in the file at full price for a page that ends
 * up serving English either way — an unbounded per-run charge for no output.
 * Transient provider errors do not count toward it.
 */
const MAX_FILE_VALIDATION_FAILURES = Number(process.env.TRANSLATE_MAX_FILE_VALIDATION_FAILURES) || 3

/**
 * Consecutive-failure counter for one file, keyed by its path *and* source
 * content, so any edit to the page starts the count over. Cleared as soon as the
 * file validates.
 */
const fileFailKey = (rel: string, source: string): string =>
  `filefail:${VALIDATOR_VERSION}:${hashText(`${rel}\n${source}`)}`

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

/** Per-file translation state, threaded through every block of one file. */
interface FileCtx {
  /** New translations for this file, committed to the TM only after it validates. */
  staged: Map<string, string>
  /**
   * Every hash this run produced with an actual model call, accumulated across
   * retry rounds. A validation failure evicts exactly these — never plain cache
   * hits, whose entries are shared with other files (hashes are content-global)
   * and were written by an earlier run that did validate.
   */
  fresh: Set<string>
}

export async function runTranslation(opts: RunOptions): Promise<RunStats> {
  const stats: RunStats = {
    files: 0,
    translatedBlocks: 0,
    cachedBlocks: 0,
    attempted: 0,
    skipped: [],
    quarantined: [],
  }
  const all = await walk(opts.contentDir)
  const sources = all.filter(
    (f) =>
      (f.endsWith('.mdx') && !LOCALE_RE.test(f)) ||
      (f.endsWith('meta.json') && !META_LOCALE_RE.test(f.split('/').at(-1) ?? '')),
  )
  const filtered = opts.only ? sources.filter((f) => f.includes(opts.only!)) : sources
  stats.attempted = filtered.length * opts.locales.length

  progress.begin({ locales: opts.locales, filesPerLocale: filtered.length, stats })
  for (const locale of opts.locales) {
    progress.startLocale(locale)
    const tm = await TM.load(locale, opts.cacheDir)
    const limit = pLimit(FILE_CONCURRENCY)

    // `ctx.staged` holds a single file's new translations; they are committed to the
    // TM only after that file validates, so a broken page is never cached.
    const translateString = async (
      ctx: FileCtx,
      text: string,
      kind: 'block' | 'inline',
      context?: string,
    ): Promise<string> => {
      const hash = hashText(text)
      const giveUp = giveUpKey(hash, kind)
      // Mark both keys used on every encounter, cache hit or not, so prune() keeps
      // the give-up marker for a block that is still present in the docs.
      tm.markUsed(hash)
      tm.markUsed(giveUp)
      const cached = opts.force ? undefined : tm.get(hash)
      if (cached !== undefined) {
        const check = validatePreservedText(text, cached, kind)
        if (check.ok) {
          stats.cachedBlocks++
          return cached
        }
        tm.delete(hash)
      }
      const pending = ctx.staged.get(hash)
      if (pending !== undefined) {
        stats.cachedBlocks++
        return pending
      }
      // Previously given up on: keep English without spending BLOCK_VALIDATION_ATTEMPTS
      // model calls to reach the same conclusion again. `--force` ignores it, so a
      // deliberate retranslation still gives every block a fresh chance.
      if (!opts.force && (tm.has(giveUp) || ctx.staged.has(giveUp))) {
        stats.cachedBlocks++
        return text
      }
      if (opts.dryRun) {
        stats.translatedBlocks++
        return text
      }
      let lastValidationError: string | undefined
      for (let attempt = 0; attempt < BLOCK_VALIDATION_ATTEMPTS; attempt++) {
        const result = await translate({ text, locale, kind, context, model: opts.model })
        // A model that returns nothing (refusal / reasoning-only finish) must not be
        // cached or written as an empty block — treat it as a failure for this file.
        if (result.trim() === '' && text.trim() !== '') {
          throw new Error(`empty model output for a ${kind} block`)
        }
        const check = validatePreservedText(text, result, kind)
        if (check.ok) {
          ctx.staged.set(hash, result)
          ctx.fresh.add(hash)
          stats.translatedBlocks++
          return result
        }
        lastValidationError = check.error
      }
      progress.note(
        `${locale}: keeping source for a ${kind} block after ${BLOCK_VALIDATION_ATTEMPTS} preservation failure(s): ${lastValidationError ?? 'unknown validation error'}`,
      )
      ctx.staged.set(giveUp, '')
      return text
    }

    // Records the last transient error per file so it can be reported only if the
    // file never succeeds across every retry round.
    const lastTransientError = new Map<string, string>()
    // Model-produced hashes per file, kept across retry rounds: a transient round
    // commits its staged blocks to the TM, so a later round would otherwise see them
    // as ordinary cache hits and could not tell them apart when evicting.
    const freshByFile = new Map<string, Set<string>>()

    // Translate one source file. Returns:
    //   'ok'        — written (or a no-op dry run)
    //   'skip'      — deterministic failure (broken output removed; retried next run)
    //   'transient' — recoverable failure (provider/network/rate-limit/empty
    //                 response); retried in-run by the round loop below.
    const processFile = (rel: string): Promise<'ok' | 'skip' | 'transient'> =>
      limit(async () => {
        const abs = join(opts.contentDir, rel)
        const staged = new Map<string, string>()
        let fresh = freshByFile.get(rel)
        if (!fresh) {
          fresh = new Set<string>()
          freshByFile.set(rel, fresh)
        }
        const ctx: FileCtx = { staged, fresh }
        try {
          if (rel.endsWith('meta.json')) {
            const meta = JSON.parse(await readFile(abs, 'utf8'))
            const map = new Map<string, string>()
            for (const s of extractMetaStrings(meta))
              map.set(s, await translateString(ctx, s, 'inline'))
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
          const failKey = fileFailKey(rel, source)
          tm.markUsed(failKey)
          const failures = Number(tm.get(failKey) ?? 0)
          if (!opts.force && failures >= MAX_FILE_VALIDATION_FAILURES) {
            // Already proven unfixable for this exact source. The page serves English
            // whether or not we retry, so stop paying to re-translate every block.
            //
            // Still remove any locale file present: the earlier failure that deleted
            // it may never have been pushed (a cancelled job, or a translations push
            // that exhausted its retries), so the checkout can carry a translation
            // that predates the current source. Quarantine is not counted as pending
            // work, so nothing else would ever come back to clean it up.
            //
            // Never during a dry run: every other write, orphan cleanup, and cache
            // save is suppressed there, so previewing a quarantined page must not
            // delete generated docs from the worktree.
            if (!opts.dryRun) {
              await unlink(join(opts.contentDir, localePath(rel, locale, '.mdx'))).catch(() => {})
            }
            stats.quarantined.push(
              `${rel} [${locale}]: left in English after ${failures} validation failures (edit the page, bump VALIDATOR_VERSION, or run with --force to retry)`,
            )
            return 'skip'
          }
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
              const t = await translateString(ctx, clean, 'inline', neighborContext(segs, i))
              outSegs.push({ text: escapeJsString(t, seg.jsQuote) })
              continue
            }
            let text = await translateString(ctx, seg.text, 'block', neighborContext(segs, i))
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
              outData[key] = await translateString(ctx, val, 'inline')
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
            // Evict only what this run's model calls produced (across every round —
            // a transient round may have committed some before the file ever
            // validated), so the next run re-translates them fresh. Cache hits are
            // left alone: they came from a run that did validate, and their hashes
            // are content-global, so evicting them would also force every other page
            // sharing that block to pay for a re-translation.
            for (const h of fresh) tm.delete(h)
            fresh.clear()
            // Give-up markers survive: they only say "this block stays English", which
            // is byte-identical to the source and so can never be the structural
            // culprit. Dropping them would re-burn BLOCK_VALIDATION_ATTEMPTS calls per
            // block on every future run of a page that never validates.
            for (const [h, v] of staged) if (isGiveUpKey(h)) tm.set(h, v)
            tm.set(failKey, String(failures + 1))
            return 'skip'
          }
          await writeFile(join(opts.contentDir, localePath(rel, locale, '.mdx')), output)
          for (const [h, v] of staged) tm.set(h, v)
          // Converged: forget the failure history so a later regression gets its own
          // full retry budget rather than inheriting a nearly-exhausted one.
          tm.delete(failKey)
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
          //
          // Persist the blocks that DID translate before the failure. Each one
          // succeeded individually (non-empty model output); only a later block in
          // the file was rate-limited. Caching them now lets the retry rounds — and
          // every subsequent workflow/cron run — skip them instead of re-translating
          // the whole file from scratch. Without this a long file re-burns all N
          // blocks on each rate-limited attempt and can only finish if all N survive
          // one uninterrupted pass, so big files never converge under load. The
          // validation-failure path above stays uncached on purpose (a bad block may
          // be the culprit there, so it must be retried fresh).
          for (const [h, v] of staged) tm.set(h, v)
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
    let canPruneCache = true
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
        if (transient.length > 0) canPruneCache = false
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
      if (canPruneCache) {
        tm.prune()
      } else {
        progress.note(`${locale}: skipped cache pruning because the locale run was incomplete`)
      }
    }

    if (!opts.dryRun) await tm.save()
    progress.finishLocale(locale)
  }

  progress.end()
  return stats
}
