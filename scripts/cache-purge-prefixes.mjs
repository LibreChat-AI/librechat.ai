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
 * Usage:
 *   node scripts/cache-purge-prefixes.mjs <file> [<file>...]
 *   git diff --name-only A B | node scripts/cache-purge-prefixes.mjs -
 *   node scripts/cache-purge-prefixes.mjs --broad
 *
 * Flags:
 *   --broad        ignore the file list and emit the broad (site-wide) set
 *   --json         emit {prefixes, files, broad, reasons} instead of plain lines
 *   --explain      write the per-file mapping decisions to stderr
 */

import { readFileSync } from 'node:fs'
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
export function readLocales(repoRoot = REPO_ROOT) {
  const src = readFileSync(resolve(repoRoot, 'lib/i18n.ts'), 'utf8')
  const block = src.match(/languages:\s*\[([^\]]*)\]/)
  if (!block) throw new Error('lib/i18n.ts: could not find i18n.languages')
  const defaultLanguage = src.match(/defaultLanguage:\s*'([^']+)'/)?.[1]
  if (!defaultLanguage) throw new Error('lib/i18n.ts: could not find i18n.defaultLanguage')
  const languages = [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  const locales = languages.filter((l) => l !== defaultLanguage)
  if (locales.length === 0) throw new Error('lib/i18n.ts: parsed an empty locale list')
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
 * Map one changed file to the prefixes it invalidates.
 *
 * Returns `{prefixes, broad, reason}`. `broad: true` means the file is shared
 * or unrecognised and the caller must fall back to the site-wide set — the
 * default for anything this function does not understand, so a new file type
 * over-purges instead of silently going stale.
 */
export function prefixesForFile(file, locales) {
  const localeAlt = locales.map((l) => l.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')

  if (INERT.some((re) => re.test(file))) {
    return { prefixes: [], broad: false, reason: 'inert (not part of the deployed site)' }
  }

  // --- content/docs -------------------------------------------------------
  const docs = file.match(/^content\/docs\/(.*)$/)
  if (docs) {
    const rest = docs[1]

    // meta.json / meta.<locale>.json — sidebar and ordering for a whole section,
    // so every page in that section (and its subsections) changes.
    const meta = rest.match(new RegExp(`^(?:(.*)\\/)?meta(?:\\.(${localeAlt}))?\\.json$`))
    if (meta) {
      const dir = meta[1] ?? ''
      const locale = meta[2]
      if (locale) {
        return {
          prefixes: [docsPrefix(locale, dir)],
          broad: false,
          reason: `${locale} sidebar for section /${dir || '(root)'}`,
        }
      }
      // The untranslated meta.json is the source of truth for section structure;
      // fumadocs falls back to it for any locale whose meta.<locale>.json is
      // missing a key, so a change to it reaches every language.
      return {
        prefixes: [docsPrefix('', dir), ...locales.map((l) => docsPrefix(l, dir))],
        broad: false,
        reason: `section /${dir || '(root)'} in every locale (sidebar + ordering)`,
      }
    }

    // <path>.<locale>.mdx — one translated page.
    const translated = rest.match(new RegExp(`^(.*)\\.(${localeAlt})\\.mdx$`))
    if (translated) {
      const slug = stripIndex(translated[1])
      const locale = translated[2]
      return {
        prefixes: [docsPrefix(locale, slug)],
        broad: false,
        reason: `${locale} page`,
      }
    }

    // <path>.mdx — one English page. Also purge /llms*, which is generated from
    // the English docs. Translations are separate files and map on their own;
    // a locale URL with no translation 307s to the English one and that redirect
    // does not change when the English body does.
    const english = rest.match(/^(.*)\.mdx$/)
    if (english) {
      const slug = stripIndex(english[1])
      return {
        prefixes: [docsPrefix('', slug), `${HOST}/llms`],
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

  // --- everything else -----------------------------------------------------
  // lib/, components/, app/, next.config.mjs, proxy.ts, source.config.ts,
  // package.json, public/, ... any of these can change every rendered page.
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

/** Map a list of changed files to the purge payload. */
export function computePurge(files, locales) {
  const reasons = []
  const set = new Set()
  let broad = false

  for (const file of files) {
    if (!file) continue
    const result = prefixesForFile(file, locales)
    reasons.push({ file, ...result })
    if (result.broad) broad = true
    for (const prefix of result.prefixes) set.add(prefix)
  }

  const prefixes = dropCoveredPrefixes([...set])

  let collapsed = false
  if (!broad && prefixes.length > COLLAPSE_THRESHOLD) {
    broad = true
    collapsed = true
  }

  if (broad) {
    return {
      broad: true,
      collapsed,
      selectiveCount: prefixes.length,
      prefixes: broadPrefixes(locales),
      files: homepageUrls(),
      reasons,
    }
  }

  return {
    broad: false,
    collapsed,
    selectiveCount: prefixes.length,
    prefixes,
    files: [],
    reasons,
  }
}

async function main(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')))
  const positional = argv.filter((a) => !a.startsWith('--'))
  const locales = readLocales()

  let files = []
  if (!flags.has('--broad')) {
    if (positional.length === 1 && positional[0] === '-') {
      const stdin = readFileSync(0, 'utf8')
      files = stdin.split('\n')
    } else {
      files = positional
    }
    files = files.map((f) => f.trim()).filter(Boolean)
  }

  const result = flags.has('--broad')
    ? {
        broad: true,
        collapsed: false,
        selectiveCount: 0,
        prefixes: broadPrefixes(locales),
        files: homepageUrls(),
        reasons: [],
      }
    : computePurge(files, locales)

  if (flags.has('--explain')) {
    for (const r of result.reasons) {
      const target = r.broad ? 'BROAD' : r.prefixes.length ? r.prefixes.join(', ') : '(nothing)'
      process.stderr.write(`${r.file}\n  -> ${target}\n     ${r.reason}\n`)
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
    process.stderr.write(`${error.stack ?? error}\n`)
    process.exit(1)
  })
}
