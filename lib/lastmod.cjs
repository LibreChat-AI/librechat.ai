/**
 * Truthful `<lastmod>` values for the generated sitemap.
 *
 * The sitemap used to stamp `new Date()` on every URL, so each deploy told
 * Google that all ~2,700 pages — including 2,340 untouched translations — had
 * just changed. A `lastmod` that moves on every build is one search engines
 * learn to ignore, and it spends the crawl budget re-fetching pages that never
 * changed.
 *
 * Every date here comes from something real: the last commit that touched a
 * route's source file, falling back to the publication date in blog/changelog
 * frontmatter. When neither is available the route gets NO `lastmod` at all —
 * an absent value costs nothing, while a wrong one is actively misleading.
 *
 * CommonJS because `next-sitemap.config.js` is CJS and the next-sitemap binary
 * loads it directly, outside the Next/TS pipeline.
 */
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const matter = require('gray-matter')

const ROOT = path.join(__dirname, '..')

/** Separates commits in the `git log` stream; cannot occur in a path or date. */
const RECORD = '\x1e'

/**
 * File path -> ISO date of the most recent commit touching it, or `null` when
 * git can't answer truthfully.
 *
 * A shallow clone is the case worth calling out: its oldest reachable commit is
 * grafted, so git reports it as a root commit and `--name-only` attributes every
 * file that existed at that point to it. On this repository that is ~1,800 files
 * stamped with one unrelated date — the same class of lie the real-`lastmod`
 * change exists to remove. Refuse to guess and let callers omit the field.
 */
let gitDatesCache
function gitDates() {
  if (gitDatesCache !== undefined) return gitDatesCache

  gitDatesCache = null
  try {
    const shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (shallow !== 'false') return gitDatesCache

    const log = execFileSync(
      'git',
      ['log', '--no-renames', '--name-only', `--pretty=format:${RECORD}%aI`],
      {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 256 * 1024 * 1024,
      },
    )

    // git log is newest-first, so the first date seen for a path is its latest.
    const dates = new Map()
    for (const record of log.split(RECORD)) {
      const [date, ...files] = record.split('\n')
      if (!date) continue
      for (const file of files) {
        if (file && !dates.has(file)) dates.set(file, date)
      }
    }
    gitDatesCache = dates
  } catch {
    // No git, no history, or not a repository: fall through to null.
  }

  if (gitDatesCache === null) {
    // Worth surfacing: the sitemap is still correct, but docs pages ship
    // without a <lastmod> until the build has full history. Blog and changelog
    // entries keep their frontmatter dates either way.
    console.warn(
      '[sitemap] No usable git history (shallow clone or no repository); ' +
        'docs URLs will omit <lastmod>. Check out with full history to restore per-page dates.',
    )
  }
  return gitDatesCache
}

const exists = (repoPath) => fs.existsSync(path.join(ROOT, repoPath))

/**
 * The MDX file behind a docs route. Fumadocs resolves a section either from
 * `<slug>.mdx` or from `<slug>/index.mdx`, and a translation is the same path
 * with a `.<locale>` infix.
 */
function docsFile(slug, locale) {
  const infix = locale ? `.${locale}` : ''
  const base = slug ? `content/docs/${slug}` : 'content/docs/index'
  const candidates = slug
    ? [`${base}${infix}.mdx`, `${base}/index${infix}.mdx`]
    : [`${base}${infix}.mdx`]
  return candidates.find(exists)
}

/**
 * The repository file a sitemap route is generated from, or `undefined` when
 * the route has no single source (a listing page assembled from a collection,
 * say). Paths are repo-relative, matching what `git log --name-only` prints.
 */
function sourceFileFor(route) {
  const clean = route.split(/[?#]/)[0].replace(/\/+$/, '') || '/'

  const docs = /^\/docs(?:\/(.*))?$/.exec(clean)
  if (docs) return docsFile(docs[1] ?? '')

  // `/<locale>/docs/...`. The locale is validated by whether a translated file
  // exists, so this needs no copy of the language list to drift out of sync.
  const localized = /^\/([^/]+)\/docs(?:\/(.*))?$/.exec(clean)
  if (localized) return docsFile(localized[2] ?? '', localized[1])

  const post = /^\/(blog|changelog)\/(.+)$/.exec(clean)
  if (post) {
    return [`content/${post[1]}/${post[2]}.mdx`, `content/${post[1]}/${post[2]}.md`].find(exists)
  }

  const dir = clean === '/' ? 'app' : `app${clean}`
  return ['tsx', 'ts', 'jsx', 'js', 'mdx'].map((ext) => `${dir}/page.${ext}`).find(exists)
}

/** The `date` in a content file's frontmatter, as an ISO string. */
function frontmatterDate(repoPath) {
  try {
    const { data } = matter(fs.readFileSync(path.join(ROOT, repoPath), 'utf8'))
    if (!data?.date) return undefined
    const parsed = new Date(data.date)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
  } catch {
    return undefined
  }
}

/**
 * The `lastmod` for a sitemap route, or `undefined` when no honest value
 * exists. next-sitemap omits falsy fields, so returning `undefined` leaves the
 * `<lastmod>` tag off that URL entirely.
 */
function lastmodFor(route) {
  const file = sourceFileFor(route)
  if (!file) return undefined
  return gitDates()?.get(file) ?? frontmatterDate(file)
}

module.exports = { lastmodFor, sourceFileFor, docsFile, frontmatterDate, gitDates }
