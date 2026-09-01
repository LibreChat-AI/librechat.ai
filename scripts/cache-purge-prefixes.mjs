/**
 * Maps changed repository files to the Cloudflare cache prefixes they invalidate.
 *
 * Used by .github/workflows/cache-purge.yml after a production deploy. The
 * output is the list of `hostname/path` prefixes to hand to Cloudflare's
 * purge-by-prefix API, one per line.
 *
 * Why prefixes and not URLs: the App Router serves the HTML document and the
 * RSC flight payload at the same path, and the flight request carries a
 * client-generated `?_rsc=<hash>` query. Cloudflare keeps the query string in
 * the cache key, and those hashes cannot be enumerated from CI, so a purge by
 * URL only ever removes the HTML variant. A prefix purge removes every cache
 * key that starts with the prefix — HTML and every `_rsc` variant together.
 *
 * Input is either bare paths or `git diff --name-status` lines. The status
 * matters: adding or deleting a docs page reshapes the page tree and the locale
 * map that *every* docs page renders, while editing one does not. Always pair it
 * with `--no-renames`, or git reports a moved page as its destination only and
 * the old URL is never purged.
 *
 * Usage:
 *   node scripts/cache-purge-prefixes.mjs <file> [<file>...]
 *   git diff --name-status --no-renames A B | node scripts/cache-purge-prefixes.mjs -
 *   node scripts/cache-purge-prefixes.mjs --broad
 *
 * Flags:
 *   --broad        start from the broad (site-wide) page set
 *   --assets       add every public/ asset, for recovery runs with no diff
 *   --json         emit {prefixes, files, broad, reasons} instead of plain lines
 *   --explain      write the per-file mapping decisions to stderr
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

/** The production hostname. Prefix purges take `hostname/path`, with no scheme. */
export const HOST = 'www.librechat.ai'

/**
 * Non-default locales, read from lib/i18n.ts so this file never becomes a
 * second copy of the locale list that can drift from the one the site builds.
 * `hideLocale: 'default-locale'` keeps English at `/docs/...`; every other
 * locale is served under `/<locale>/docs/...`.
 *
 * Parsed rather than imported because this script runs on a bare runner with no
 * `pnpm install` and no TypeScript loader — the purge has to work even when the
 * dependency install would fail.
 */
function parseLocales(src, label) {
  const block = src.match(/languages:\s*\[([^\]]*)\]/)
  if (!block) throw new Error(`${label}: could not find i18n.languages`)
  const defaultLanguage = src.match(/defaultLanguage:\s*'([^']+)'/)?.[1]
  if (!defaultLanguage) throw new Error(`${label}: could not find i18n.defaultLanguage`)
  const languages = [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  const locales = languages.filter((l) => l !== defaultLanguage)
  if (locales.length === 0) throw new Error(`${label}: parsed an empty locale list`)
  return locales
}

export function readLocales(
  repoRoot = REPO_ROOT,
  basePath = process.env.BASE_I18N_FILE,
  fallbackPath = process.env.FALLBACK_I18N_FILE,
) {
  const deployedPath = resolve(repoRoot, 'lib/i18n.ts')
  let locales = []

  try {
    locales = parseLocales(readFileSync(deployedPath, 'utf8'), 'lib/i18n.ts')
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    process.stderr.write(
      `::warning::The deployed tree has no lib/i18n.ts; using trusted rollback locale data.\n`,
    )
  }

  // A locale dropped in this deploy still has cached pages under /<locale>, but
  // the deployed file no longer names it, so `broadPrefixes()` would not purge
  // them and that language would sit there until the TTL. Union with both the
  // diff base and trusted workflow revision. Old rollback trees can predate the
  // locale config entirely, in which case those two sources are the only safe
  // route inventory.
  for (const localePath of new Set([basePath, fallbackPath].filter(Boolean))) {
    try {
      const source = readFileSync(localePath, 'utf8')
      if (!source.trim()) continue
      locales = [...new Set([...locales, ...parseLocales(source, localePath)])]
    } catch (error) {
      process.stderr.write(
        `::warning::Could not read locales from ${localePath}: ${error.message}\n`,
      )
    }
  }

  if (locales.length === 0) {
    throw new Error('Could not read locales from the deployed, base, or trusted workflow config')
  }
  return locales
}

/**
 * Paths that cannot change a rendered page. Everything else that is not content
 * falls back to the broad purge, so this list is deliberately short: a file only
 * belongs here when it is provably not part of the deployed site.
 */
const INERT = [
  /^\.github\//,
  /^docs\//, // repo-internal notes; site content lives in content/
  /^e2e\//,
  /^__tests__\//,
  /^scripts\/screenshots\//,
  /^scripts\/cache-(build-assets|purge-prefixes)\.mjs$/,
  /(^|\/)__tests__\//,
  /\.test\.(ts|tsx|mjs|js)$/,
  /^(README|LICENSE|CONTRIBUTING|SECURITY|CHANGELOG|PURGE-NOTES)(\.md)?$/,
  /^\.(gitignore|prettierignore|prettierrc\.js|lycheeignore|npmrc|husky)/,
  /^playwright\.config\.ts$/,
  /^vitest\.config\.ts$/,
  /^eslint\.config\.mjs$/,
]

/**
 * The broad set: every cached route family plus the standalone landing pages.
 *
 * `/<locale>` covers both the localized landing page and `/<locale>/docs/**`.
 * `/llms` covers /llms.txt, /llms-full.txt and /llms.mdx/**, which are all
 * generated from the docs content.
 */
export function broadPrefixes(locales) {
  return [
    // The four top-level content trees.
    `${HOST}/docs`,
    `${HOST}/blog`,
    `${HOST}/changelog`,
    `${HOST}/authors`,
    // Machine-readable docs surfaces.
    `${HOST}/llms`,
    `${HOST}/api/search`,
    // Localized landing pages + localized docs.
    ...locales.map((locale) => `${HOST}/${locale}`),
    // Standalone pages.
    `${HOST}/about`,
    `${HOST}/toolkit`,
    `${HOST}/privacy`,
    `${HOST}/tos`,
    `${HOST}/cookie`,
  ]
}

/**
 * The homepage cannot be purged by prefix: `www.librechat.ai/` is a prefix of
 * every URL on the zone, so it would evict the static asset cache too — the
 * thing purge_everything is avoided for. Purge it by exact URL instead and
 * accept that its `?_rsc=` variants are not covered (they are `private,
 * no-store` in next.config.mjs, so they should not be in the edge cache at all).
 *
 * The localized landing pages need no entry here: `/<locale>` is a usable
 * prefix and is already in the broad set.
 */
export function homepageUrls() {
  return [`https://${HOST}/`]
}

/**
 * Percent-encode a repository path for use in a URL, segment by segment so the
 * separators survive.
 *
 * Not cosmetic: `public/images/logos/Stripe wordmark - Slate.svg` is a real file
 * here, and a raw space in a `files` entry does not just miss that asset — the
 * whole call is rejected, so every URL batched with it goes unpurged too.
 */
export function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

/**
 * Everything under `public/`, as purge targets, read from the checkout.
 *
 * For the recovery paths that have no diff to work from: a manual run with no
 * range, an unreachable base commit, or no previously purged deployment. The
 * broad set covers pages only, so without this a run that cannot see the diff
 * leaves a replaced asset served from the edge — and those are exactly the runs
 * that exist because something already went wrong.
 *
 * Top-level directories become prefixes and top-level files become exact URLs,
 * which on this repo is 2 + 21 entries: precise, bounded, and no guessing about
 * what changed. Deliberately NOT part of the ordinary broad set, where evicting
 * every image on any shared-file change would be the asset MISS wave that
 * avoiding `purge_everything` exists to prevent.
 */
export function assetFallbackTargets(repoRoot = REPO_ROOT) {
  const entries = readdirSync(resolve(repoRoot, 'public'), { withFileTypes: true })
  return {
    prefixes: entries.filter((e) => e.isDirectory()).map((e) => `${HOST}/${encodePath(e.name)}`),
    files: entries.filter((e) => e.isFile()).map((e) => `https://${HOST}/${encodePath(e.name)}`),
  }
}

/**
 * The prerendered per-locale search index.
 *
 * app/api/search/[lang]/route.ts builds one JSON index per locale from
 * docsSource with `revalidate = false`, and components/search-dialog.tsx points
 * Orama at `/api/search/<locale>`, so a docs edit changes it. One prefix covers
 * every locale.
 *
 * Latent today: the route returns cf-cache-status DYNAMIC, and being build
 * output rather than a cache it is replaced by the deploy itself, so there is
 * nothing stale to clear. It is here because if the zone's Cache Rule ever
 * covers /api, a stale index means search returning deleted pages — user-visible
 * and hard to attribute — and the cost of carrying it is one item.
 */
const SEARCH_INDEX_PREFIX = `${HOST}/api/search`

/** Strip a trailing `index` segment so a section index maps to the section root. */
function stripIndex(slug) {
  if (slug === 'index') return ''
  return slug.replace(/(^|\/)index$/, '')
}

function docsPrefix(locale, slug) {
  const base = locale ? `${HOST}/${locale}/docs` : `${HOST}/docs`
  return slug ? `${base}/${slug}` : base
}

/**
 * The docs root in every language — i.e. every docs page there is.
 *
 * Needed more often than it looks, because two things are rendered into *every*
 * docs page rather than just the page they describe:
 *
 *   - the sidebar. lib/docs-layout.tsx hands the complete `docsSource.pageTree`
 *     to `DocsLayout` for every page, so anything that reshapes the tree (a
 *     meta.json edit, a page added or removed) changes every page in that
 *     language.
 *   - the language switcher. `getAvailableLocalesBySlug()` in lib/doc-locales.ts
 *     builds one site-wide slug -> locales map and lib/docs-layout.tsx passes it
 *     into `DocsI18nProvider` on every page, so adding or deleting a single
 *     translation changes every docs page in every language.
 */
function docsTreePrefixes(locales) {
  return [docsPrefix('', ''), ...locales.map((locale) => docsPrefix(locale, ''))]
}

/**
 * Statuses that reshape what every docs page renders, rather than only the page
 * they belong to. `A`/`D` come from git. `T` is ours: the workflow marks a
 * modification whose patch touches a frontmatter `title:`/`icon:` line, because
 * those values populate the page-tree node the sidebar draws on every page, and
 * git would otherwise report the edit as an ordinary `M`.
 */
const STRUCTURAL = new Set(['A', 'D', 'T'])

const STRUCTURAL_REASON = {
  A: 'added',
  D: 'deleted',
  T: 'frontmatter title/icon changed',
}

/**
 * Parse one line of `git diff --name-status --no-renames` into `{status, file}`.
 *
 * A bare path (no status column) is treated as a modification, so passing plain
 * filenames on the command line still works for ad-hoc dry runs.
 */
export function parseChangedLine(line) {
  const parts = line.split('\t')
  if (parts.length < 2 || !/^[A-Z]\d*$/.test(parts[0])) return { status: 'M', file: line }
  // Last field: for a rename/copy `--name-status` emits `R100<TAB>old<TAB>new`.
  // The workflow passes --no-renames so those never appear, but if one did we
  // would rather purge the destination than choke on the line.
  return { status: parts[0][0], file: parts[parts.length - 1] }
}

/**
 * Parse a whole `git diff --name-status` payload into `{status, file}` records.
 *
 * NUL-delimited (`-z`) is the format the workflow uses and the only one that is
 * unambiguous: git prints pathnames verbatim, so there is no C-quoting to decode
 * and no whitespace to distinguish from a delimiter. Every bug this seam has
 * produced — `"public/images/caf\303\251.png"` arriving quoted, a trailing space
 * being trimmed off a name — was the line-based format leaking into the path.
 *
 * Newline-delimited input is still accepted so ad-hoc dry runs can pipe a plain
 * `--name-status` or a bare list of paths.
 */
export function parseChangedInput(raw) {
  if (!raw.includes('\0')) {
    return raw
      .split('\n')
      .map((line) => line.replace(/\r$/, ''))
      .filter((line) => line !== '')
      .map(parseChangedLine)
  }

  // `-z` emits status and path as separate records: `M<NUL>path<NUL>`.
  const records = raw.split('\0')
  if (records.length > 0 && records[records.length - 1] === '') records.pop()
  if (records.length % 2 !== 0) {
    throw new Error(`Malformed -z diff: ${records.length} records, expected pairs`)
  }
  const changes = []
  for (let i = 0; i < records.length; i += 2) {
    changes.push({ status: records[i][0], file: records[i + 1] })
  }
  return changes
}

/**
 * Paths whose frontmatter `title:`/`icon:` changed, as a NUL-delimited file from
 * `git diff --name-only -z -G`. Read here rather than joined in the workflow
 * because ubuntu-latest's `awk` is mawk, which does not handle a NUL record
 * separator — and doing it here makes it testable.
 */
export function readTreeEdits(path = process.env.TREE_EDITS_FILE) {
  if (!path) return new Set()
  try {
    return new Set(
      readFileSync(path, 'utf8')
        .split('\0')
        .filter((entry) => entry !== ''),
    )
  } catch {
    return new Set()
  }
}

/**
 * Map one changed file to the prefixes it invalidates.
 *
 * `status` is a git status letter (`A`, `M`, `D`); it decides whether a change
 * is structural, since adds and deletes reshape what every docs page renders.
 *
 * Returns `{prefixes, files?, broad, reason}`. `broad: true` means the file is
 * shared or unrecognised and the caller must fall back to the site-wide set —
 * the default for anything this function does not understand, so a new file type
 * over-purges instead of silently going stale.
 */
export function prefixesForFile(file, locales, status = 'M') {
  const localeAlt = locales.map((l) => l.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')

  if (INERT.some((re) => re.test(file))) {
    return { prefixes: [], broad: false, reason: 'inert (not part of the deployed site)' }
  }

  // --- content/docs -------------------------------------------------------
  const docs = file.match(/^content\/docs\/(.*)$/)
  if (docs) {
    const rest = docs[1]

    // meta.json / meta.<locale>.json — the sidebar. NOT section-scoped: every
    // docs page renders the whole tree (see docsTreePrefixes), so a reordered
    // section leaves a stale sidebar on pages nowhere near it.
    const meta = rest.match(new RegExp(`^(?:(.*)\\/)?meta(?:\\.(${localeAlt}))?\\.json$`))
    if (meta) {
      const locale = meta[2]
      if (locale) {
        return {
          prefixes: [docsPrefix(locale, ''), SEARCH_INDEX_PREFIX],
          broad: false,
          reason: `${locale} sidebar — every ${locale} docs page`,
        }
      }
      // The untranslated meta.json is the source of truth for structure;
      // fumadocs falls back to it for any locale whose meta.<locale>.json is
      // missing a key, so a change to it reaches every language.
      //
      // /llms goes with it: app/llms-full.txt/route.ts builds the export from
      // getOrderedDocsPages(), which walks the same `docsSource.pageTree`. Only
      // the untranslated file matters there, since getOrderedDocsPages() pins
      // itself to i18n.defaultLanguage.
      return {
        prefixes: [...docsTreePrefixes(locales), `${HOST}/llms`, SEARCH_INDEX_PREFIX],
        broad: false,
        reason: 'sidebar in every locale — every docs page (+ llms export)',
      }
    }

    // <path>.<locale>.mdx — one translated page, unless the file appeared or
    // disappeared: `getAvailableLocalesBySlug()` is a site-wide map embedded in
    // every docs page, and lib/docs-page.tsx derives hreflang alternates from
    // which translations exist, so an add/delete changes every page's markup.
    const translated = rest.match(new RegExp(`^(.*)\\.(${localeAlt})\\.mdx$`))
    if (translated) {
      const slug = stripIndex(translated[1])
      const locale = translated[2]
      if (STRUCTURAL.has(status)) {
        return {
          prefixes: [...docsTreePrefixes(locales), SEARCH_INDEX_PREFIX],
          broad: false,
          reason: `${locale} translation ${STRUCTURAL_REASON[status]} — language switcher and hreflang on every docs page`,
        }
      }
      return {
        prefixes: [docsPrefix(locale, slug), SEARCH_INDEX_PREFIX],
        broad: false,
        reason: `${locale} page`,
      }
    }

    // <path>.mdx — one English page, unless it appeared or disappeared, which
    // adds or removes a node from the page tree every docs page renders.
    // Otherwise translations map on their own; a locale URL with no translation
    // 307s to the English one, and that redirect does not change when the
    // English body does. /llms* is generated from the English docs either way.
    const english = rest.match(/^(.*)\.mdx$/)
    if (english) {
      const slug = stripIndex(english[1])
      if (STRUCTURAL.has(status)) {
        return {
          prefixes: [...docsTreePrefixes(locales), `${HOST}/llms`, SEARCH_INDEX_PREFIX],
          broad: false,
          reason: `English page ${STRUCTURAL_REASON[status]} — page tree on every docs page (+ llms export)`,
        }
      }
      return {
        prefixes: [docsPrefix('', slug), `${HOST}/llms`, SEARCH_INDEX_PREFIX],
        broad: false,
        reason: 'English page (+ generated llms surfaces)',
      }
    }

    // Anything else under content/docs (a new file type, an asset): purge the
    // section it lives in rather than guessing which pages embed it.
    const dir = rest.includes('/') ? rest.slice(0, rest.lastIndexOf('/')) : ''
    return {
      prefixes: [docsPrefix('', dir), ...locales.map((l) => docsPrefix(l, dir))],
      broad: false,
      reason: 'unrecognised file under content/docs — purging its section',
    }
  }

  // --- content/blog, content/changelog ------------------------------------
  // The listing page shares its prefix with every post under it, so purging the
  // post also purges the index — which has to happen anyway, since the index
  // shows titles, dates and excerpts. /authors goes with the blog because author
  // pages list a writer's posts.
  if (/^content\/blog\//.test(file)) {
    return {
      prefixes: [`${HOST}/blog`, `${HOST}/authors`],
      broad: false,
      reason: 'blog index + posts + author pages',
    }
  }
  if (/^content\/changelog\//.test(file)) {
    return {
      prefixes: [`${HOST}/changelog`],
      broad: false,
      reason: 'changelog index + entries',
    }
  }

  // --- public/ -------------------------------------------------------------
  // Static assets are served from the site root at the same URL forever, so
  // nothing else purges them: a page prefix purge cannot reach /images/foo.png.
  // Replacing one in place is exactly how the socialcards went stale for ~15
  // days (see the note in app/api/og/route.tsx), so purge the asset's own URL.
  //
  // Still broad on top of that, because a replaced asset can change page HTML
  // two ways we cannot trace per page: OG_SOURCES in lib/og-version.mjs feeds
  // OG_VERSION, which next.config.mjs inlines into every page's card URLs, and
  // remark-image adds build-time width/height for local images, which move if
  // the replacement has different dimensions.
  const asset = file.match(/^public\/(.+)$/)
  if (asset) {
    // A raster image passed to next/image is also served from /_next/image with
    // the source as a query parameter, and those cache keys cannot be
    // enumerated. Query strings cannot appear in a prefix, so the only reachable
    // unit is the whole optimizer path.
    //
    // On this zone that purge is currently a no-op: /_next/image returns
    // cf-cache-status DYNAMIC, so Cloudflare holds nothing there and the stale
    // bytes live in Vercel's optimizer cache instead. It is one prefix on a rare
    // trigger, and it becomes correct the moment the zone's Cache Rule covers
    // that path, so it is cheaper to carry it than to remember to add it later.
    // The durable fix for the Vercel layer is a versioned or content-hashed
    // source URL, the way OG_VERSION already works for social cards.
    const optimizable = /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(asset[1])
    return {
      prefixes: optimizable ? [`${HOST}/_next/image`] : [],
      files: [`https://${HOST}/${encodePath(asset[1])}`],
      broad: true,
      reason: optimizable
        ? 'public image — its URL, the optimizer path, plus pages (OG fingerprint, dimensions)'
        : 'public asset — purging its URL, plus pages (OG fingerprint, image dimensions)',
    }
  }

  // --- everything else -----------------------------------------------------
  // lib/, components/, app/, next.config.mjs, proxy.ts, source.config.ts,
  // package.json, ... any of these can change every rendered page.
  // Per-page dependency analysis is not attempted.
  return { prefixes: [], broad: true, reason: 'shared/global file' }
}

/**
 * Drop prefixes already covered by a shorter one in the same set: purging
 * `www.librechat.ai/docs` also purges `www.librechat.ai/docs/local/docker`, so
 * sending both wastes an item against the per-call limit.
 *
 * Only exact and segment-boundary containment count. Cloudflare's prefix match
 * is a plain string match, so `/docs/features/agents` would in fact also cover
 * `/docs/features/agents-anything` — but relying on that to *drop* an entry
 * would make a mapping bug silently under-purge, so keep the strict rule here
 * and let the string match over-purge on the Cloudflare side.
 */
export function dropCoveredPrefixes(prefixes) {
  const sorted = [...new Set(prefixes)].sort()
  return sorted.filter(
    (prefix) => !sorted.some((other) => other !== prefix && prefix.startsWith(`${other}/`)),
  )
}

/**
 * Above this many prefixes a "selective" purge is neither selective nor cheap:
 * a change that wide is a site-wide change in practice, and the broad set is
 * both smaller to send and safer. Collapsing is logged, never silent.
 */
export const COLLAPSE_THRESHOLD = 200

/**
 * Map a list of changed files to the purge payload.
 *
 * `forceBroad` starts from the site-wide set instead of arriving there by
 * escalation. Combined with a file list it is the recovery mode: broad page
 * coverage *plus* everything only a diff can reveal — the exact URLs of changed
 * assets, and locales that existed at the base but not at the head. With an
 * empty file list it degrades to the plain broad set.
 */
export function computePurge(files, locales, { forceBroad = false } = {}) {
  const reasons = []
  const set = new Set()
  // Exact URLs, for the things that have no usable prefix: static assets, and
  // the homepage when the purge goes broad.
  const urls = new Set()
  let broad = forceBroad

  for (const entry of files) {
    if (!entry) continue
    const { status, file } = typeof entry === 'string' ? parseChangedLine(entry) : entry
    if (!file) continue
    const result = prefixesForFile(file, locales, status)
    reasons.push({ file, status, ...result })
    if (result.broad) broad = true
    for (const prefix of result.prefixes) set.add(prefix)
    for (const url of result.files ?? []) urls.add(url)
  }

  const prefixes = dropCoveredPrefixes([...set])

  let collapsed = false
  if (!broad && prefixes.length > COLLAPSE_THRESHOLD) {
    broad = true
    collapsed = true
  }

  if (broad) {
    // Asset URLs and any prefix outside the broad set survive the escalation.
    // The broad set is pages only, so replacing the collected prefixes wholesale
    // would silently drop things it does not cover — the changed asset itself,
    // and /_next/image. dropCoveredPrefixes then removes the page prefixes the
    // broad set already subsumes, so nothing is sent twice.
    for (const url of homepageUrls()) urls.add(url)
    return {
      broad: true,
      collapsed,
      selectiveCount: prefixes.length,
      prefixes: dropCoveredPrefixes([...broadPrefixes(locales), ...set]),
      files: [...urls].sort(),
      reasons,
    }
  }

  return {
    broad: false,
    collapsed,
    selectiveCount: prefixes.length,
    prefixes,
    files: [...urls].sort(),
    reasons,
  }
}

/** Every flag this script understands. A typo must not be mistaken for one of these. */
export const KNOWN_FLAGS = ['--broad', '--assets', '--json', '--explain']

/**
 * Split argv into flags and positionals, rejecting anything unrecognised.
 *
 * Silently ignoring an unknown flag is dangerous here rather than merely untidy:
 * a mistyped `--broad` in the workflow would produce an empty result, land in
 * the "nothing to purge" branch, and skip the purge without a word — the exact
 * silent staleness this whole workflow exists to prevent.
 */
export function parseArgs(argv) {
  const flags = new Set()
  const positional = []

  for (const arg of argv) {
    // A bare `-` is the read-from-stdin operand, not a flag.
    if (arg === '-' || !arg.startsWith('-')) {
      positional.push(arg)
      continue
    }
    if (!KNOWN_FLAGS.includes(arg)) {
      throw new Error(`Unknown flag: ${arg}\nKnown flags: ${KNOWN_FLAGS.join(', ')}`)
    }
    flags.add(arg)
  }

  return { flags, positional }
}

async function main(argv) {
  const repoRoot = process.cwd()
  const { flags, positional } = parseArgs(argv)
  const locales = readLocales(repoRoot)

  // Read the file list even with --broad: recovery runs pass both, so that the
  // broad page set is topped up with the asset URLs and removed locales that
  // only a diff can reveal.
  let files = []
  if (positional.length === 1 && positional[0] === '-') {
    files = parseChangedInput(readFileSync(0, 'utf8'))
  } else {
    // Bare paths on the command line are modifications by definition.
    files = positional.map((file) => ({ status: 'M', file }))
  }

  // Frontmatter title/icon edits are structural even though git calls them M:
  // those values populate the page-tree node every docs page renders.
  const treeEdits = readTreeEdits()
  for (const change of files) {
    if (change.status === 'M' && treeEdits.has(change.file)) change.status = 'T'
  }

  const result = computePurge(files, locales, { forceBroad: flags.has('--broad') })

  if (flags.has('--assets')) {
    const assets = assetFallbackTargets(repoRoot)
    result.prefixes = dropCoveredPrefixes([...result.prefixes, ...assets.prefixes])
    result.files = [...new Set([...result.files, ...assets.files])].sort()
  }

  if (flags.has('--explain')) {
    for (const r of result.reasons) {
      const target = r.broad ? 'BROAD' : r.prefixes.length ? r.prefixes.join(', ') : '(nothing)'
      const urls = r.files?.length ? `\n     files: ${r.files.join(', ')}` : ''
      process.stderr.write(`[${r.status}] ${r.file}\n  -> ${target}\n     ${r.reason}${urls}\n`)
    }
    if (result.collapsed) {
      process.stderr.write(
        `\n${result.selectiveCount} prefixes exceeded the ${COLLAPSE_THRESHOLD} cap — collapsed to the broad set\n`,
      )
    }
  }

  if (flags.has('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  for (const prefix of result.prefixes) process.stdout.write(`${prefix}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error.message ?? error}\n`)
    process.exit(1)
  })
}
