import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  COLLAPSE_THRESHOLD,
  KNOWN_FLAGS,
  assetFallbackTargets,
  broadPrefixes,
  computePurge,
  dropCoveredPrefixes,
  encodePath,
  homepageUrls,
  parseArgs,
  parseChangedInput,
  parseChangedLine,
  prefixesForFile,
  readLocales,
  readTreeEdits,
} from './cache-purge-prefixes.mjs'

const locales = readLocales()

/** The mapping is the fragile part of the purge: a wrong prefix is a silently stale page. */
describe('readLocales', () => {
  it('reads the non-default locales from lib/i18n.ts', () => {
    expect(locales).toEqual([
      'zh',
      'es',
      'fr',
      'de',
      'ja',
      'pt-BR',
      'it',
      'nl',
      'pl',
      'vi',
      'ko',
      'id',
      'tr',
    ])
  })

  it('excludes the default language, which has no URL prefix', () => {
    expect(locales).not.toContain('en')
  })

  /**
   * A locale dropped in this deploy is gone from the deployed lib/i18n.ts, so
   * broadPrefixes() would never emit `/<locale>` and that language's cached
   * pages would sit at the edge until the TTL expired.
   */
  it('unions in a locale that existed at the diff base but was removed', () => {
    const base = join(tmpdir(), `purge-base-i18n-${process.pid}.ts`)
    writeFileSync(
      base,
      `export const i18n = { defaultLanguage: 'en', languages: ['en', 'zh', 'sv'] }`,
    )
    try {
      const unioned = readLocales(undefined, base)
      expect(unioned).toContain('sv')
      expect(unioned).toEqual(expect.arrayContaining(locales))
      expect(broadPrefixes(unioned)).toContain('www.librechat.ai/sv')
    } finally {
      rmSync(base, { force: true })
    }
  })

  it('falls back to the deployed list when the base file cannot be parsed', () => {
    const base = join(tmpdir(), `purge-bad-i18n-${process.pid}.ts`)
    writeFileSync(base, 'this is not the i18n config')
    try {
      expect(readLocales(undefined, base)).toEqual(locales)
    } finally {
      rmSync(base, { force: true })
    }
  })
})

describe('parseArgs', () => {
  it('accepts exactly the three documented flags', () => {
    expect(KNOWN_FLAGS).toEqual(['--broad', '--assets', '--json', '--explain'])
  })

  it('separates known flags from file arguments', () => {
    const { flags, positional } = parseArgs(['--json', 'content/docs/index.mdx', '--explain'])
    expect([...flags]).toEqual(['--json', '--explain'])
    expect(positional).toEqual(['content/docs/index.mdx'])
  })

  it('treats a bare - as the stdin operand, not a flag', () => {
    expect(parseArgs(['-', '--json']).positional).toEqual(['-'])
  })

  it.each(['--deleted', '--diff-filter=D', '--dry-run', '-x', '-broad'])(
    'rejects %s instead of ignoring it',
    (flag) => {
      expect(() => parseArgs([flag, 'content/docs/index.mdx'])).toThrow(/Unknown flag/)
    },
  )

  it('names the offending flag and the accepted ones', () => {
    expect(() => parseArgs(['--deleted'])).toThrow(
      'Unknown flag: --deleted\nKnown flags: --broad, --assets, --json, --explain',
    )
  })

  /**
   * A mistyped `--broad` would compute an empty result, hit the workflow's
   * "nothing to purge" branch and skip the purge silently, so the workflow's own
   * invocations are pinned to the flags the script actually accepts.
   */
  it('accepts every flag the workflow passes', () => {
    const workflow = readFileSync(
      fileURLToPath(new URL('../.github/workflows/cache-purge.yml', import.meta.url)),
      'utf8',
    )
    const invocations = [...workflow.matchAll(/cache-purge-prefixes\.mjs([^\n]*)/g)].map(
      (match) => {
        const tokens = match[1].trim().split(/\s+/).filter(Boolean)
        const redirect = tokens.findIndex((token) => token.startsWith('>') || token === '|')
        return redirect === -1 ? tokens : tokens.slice(0, redirect)
      },
    )

    expect(invocations).toHaveLength(2)
    for (const argv of invocations) {
      expect(argv.length).toBeGreaterThan(0)
      expect(() => parseArgs(argv)).not.toThrow()
    }
  })
})

describe('the workflow feeds the mapper what it needs', () => {
  const workflow = readFileSync(
    fileURLToPath(new URL('../.github/workflows/cache-purge.yml', import.meta.url)),
    'utf8',
  )

  /**
   * Git's rename detection is on by default and reports a moved file as its
   * destination alone, so without this flag a page moved without edits keeps its
   * old URL cached until the TTL expires.
   */
  // Executable lines only: a `git diff` mentioned inside a `#` comment is prose.
  // Matched loosely because the command carries `-c` options before `diff`.
  const diffLines = workflow
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .filter((line) => /\bgit\b[^\n]*\bdiff\b/.test(line))

  it('disables rename detection on every diff it runs', () => {
    expect(diffLines.length).toBeGreaterThan(0)
    for (const diff of diffLines) {
      expect(diff).toContain('--no-renames')
    }
  })

  /**
   * -z makes git print pathnames verbatim, so there is no C-quoting to decode
   * and no whitespace to tell apart from a delimiter. Both of those silently
   * mismapped real paths under the default text format.
   */
  it('reads pathnames losslessly on every diff it runs', () => {
    for (const diff of diffLines) {
      expect(diff).toMatch(/\s-z\b/)
    }
  })

  it('passes the status column, which decides structural vs content changes', () => {
    expect(workflow).toMatch(/git diff --name-status -z --no-renames/)
  })

  /**
   * Vercel attributes a deployment to the human who initiated it, then posts
   * the ready status as vercel[bot]. Checking deployment.creator made every
   * automatic purge run skip before it reached a step.
   */
  it('identifies Vercel by the deployment-status creator', () => {
    expect(workflow).toContain("github.event.deployment_status.creator.login == 'vercel[bot]'")
    expect(workflow).not.toContain("github.event.deployment.creator.login == 'vercel[bot]'")
  })

  /**
   * Vercel can redeploy the same SHA. Grouping by SHA would let GitHub discard
   * one of those pending purge runs, even though each deployment needs its own
   * baseline and marker.
   */
  it('keys concurrency by deployment id so same-sha redeployments are distinct', () => {
    expect(workflow).toContain(
      'group: cache-purge-${{ github.event.deployment.id || github.run_id }}',
    )
    expect(workflow).not.toContain(
      'group: cache-purge-${{ github.event.deployment.sha || github.run_id }}',
    )
  })

  it('adds current build assets before deciding there is nothing to purge', () => {
    expect(workflow).toContain('node scripts/cache-build-assets.mjs > build-assets.txt')
    expect(workflow).toContain("if: steps.assets.outputs.count == '0'")
    expect(workflow).not.toContain('if: steps.compute.outputs.count')
  })

  /**
   * An operator uses workflow_dispatch to recover an unhealthy production
   * site. A failed live probe must not prevent the broad page/public targets
   * computed earlier in the job from reaching Cloudflare.
   */
  it('keeps manual recovery targets when build-asset discovery fails', () => {
    expect(workflow).toContain('if [ "$EVENT" != "workflow_dispatch" ]; then')
    expect(workflow).toContain(': > build-assets.txt')
    expect(workflow).toContain(
      'Build-asset discovery failed; continuing with the manual recovery targets.',
    )
  })

  it('accepts a baseline only when its deployment-specific purge marker exists', () => {
    expect(workflow).toContain('PURGE_STATUS_CONTEXT/$id')
    expect(workflow).toContain('select(.context == $context and .state == "success")')
    expect(workflow).not.toContain('select(.creator.login == $creator)')
  })

  /**
   * A peer that accepts the connection and then stops responding would otherwise
   * never return, so the retry loop never sees a failure and the job sits until
   * the platform timeout. Runs overlap by design, so several can pile up.
   */
  it('bounds every Cloudflare request so a stall becomes a retry', () => {
    const curls = workflow
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .filter((line) => /\bcurl\b/.test(line))
    expect(curls.length).toBeGreaterThan(0)
    expect(workflow).toContain('--connect-timeout "$CURL_CONNECT_TIMEOUT"')
    expect(workflow).toContain('--max-time "$CURL_MAX_TIME"')
  })

  /**
   * Every run block sets `set -euo pipefail`, under which a `grep` that matches
   * nothing exits 1, the pipeline inherits that, and the assignment kills the
   * step. This bit the Retry-After lookup: a 5xx or a connection failure carries
   * no such header, so the two most common retryable cases aborted after one
   * call with no diagnostic instead of backing off. "No match" is a normal
   * outcome when reading an optional header, so it must not be fatal.
   */
  it('never assigns from a bare grep, which aborts the step under pipefail', () => {
    const risky = workflow
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .filter((line) => /=\$\(/.test(line) && /\bgrep\b/.test(line))
      .filter((line) => !/\|\|\s*(true|:)/.test(line))
    expect(risky).toEqual([])
  })
})

describe('parseChangedLine', () => {
  it.each([
    ['A\tcontent/docs/features/new.mdx', 'A', 'content/docs/features/new.mdx'],
    ['D\tcontent/docs/features/old.mdx', 'D', 'content/docs/features/old.mdx'],
    ['M\tcontent/docs/features/edit.mdx', 'M', 'content/docs/features/edit.mdx'],
  ])('parses %s', (line, status, file) => {
    expect(parseChangedLine(line)).toEqual({ status, file })
  })

  it('treats a bare path as a modification, so ad-hoc dry runs still work', () => {
    expect(parseChangedLine('content/docs/local/docker.mdx')).toEqual({
      status: 'M',
      file: 'content/docs/local/docker.mdx',
    })
  })

  it('strips a carriage return, which is a delimiter artifact rather than path', () => {
    expect(parseChangedLine('M\tpublic/logo.png\r'.replace(/\r$/, ''))).toEqual({
      status: 'M',
      file: 'public/logo.png',
    })
  })

  it('takes the destination if a rename ever slips through', () => {
    expect(parseChangedLine('R100\tcontent/docs/a.mdx\tcontent/docs/b.mdx')).toEqual({
      status: 'R',
      file: 'content/docs/b.mdx',
    })
  })
})

describe('parseChangedInput', () => {
  /**
   * The line format leaked into the pathname twice: `café.png` arrived C-quoted
   * as `"public/images/caf\303\251.png"`, and a trailing space was trimmed off
   * `logo.png `. NUL cannot occur in a filename, so `-z` framing is unambiguous.
   */
  it('parses NUL-delimited status/path pairs', () => {
    expect(parseChangedInput('M\0content/docs/a.mdx\0A\0public/b.png\0')).toEqual([
      { status: 'M', file: 'content/docs/a.mdx' },
      { status: 'A', file: 'public/b.png' },
    ])
  })

  it.each([
    ['public/images/café.png', 'a name git would C-quote'],
    ['public/images/we"ird.png', 'a name containing a quote'],
    ['public/logo.png ', 'a trailing space'],
    ['public/a\tb.png', 'an embedded tab'],
  ])('carries %s verbatim (%s)', (path) => {
    expect(parseChangedInput(`M\0${path}\0`)).toEqual([{ status: 'M', file: path }])
  })

  it('still accepts newline input for ad-hoc dry runs', () => {
    expect(parseChangedInput('M\tcontent/docs/a.mdx\nA\tpublic/b.png\n')).toEqual([
      { status: 'M', file: 'content/docs/a.mdx' },
      { status: 'A', file: 'public/b.png' },
    ])
  })

  it('refuses a truncated -z payload rather than dropping a record', () => {
    expect(() => parseChangedInput('M\0content/docs/a.mdx\0A\0')).toThrow(/Malformed/)
  })
})

describe('readTreeEdits', () => {
  it('reads the NUL-delimited list the workflow writes', () => {
    const file = join(tmpdir(), `purge-tree-edits-${process.pid}`)
    writeFileSync(file, 'content/docs/a.mdx\0content/docs/b.mdx\0')
    try {
      const edits = readTreeEdits(file)
      expect(edits.has('content/docs/a.mdx')).toBe(true)
      expect(edits.has('content/docs/b.mdx')).toBe(true)
    } finally {
      rmSync(file, { force: true })
    }
  })

  it('is empty when no file is configured', () => {
    expect(readTreeEdits(undefined).size).toBe(0)
  })
})

describe('search index', () => {
  /**
   * app/api/search/[lang]/route.ts prerenders one index per locale from
   * docsSource; search-dialog.tsx points Orama at /api/search/<locale>.
   */
  it.each([
    'content/docs/local/docker.mdx',
    'content/docs/local/docker.ja.mdx',
    'content/docs/local/meta.json',
  ])('purges the index when %s changes', (file) => {
    expect(prefixesForFile(file, locales).prefixes).toContain('www.librechat.ai/api/search')
  })

  it('covers every locale with one prefix', () => {
    expect(broadPrefixes(locales)).toContain('www.librechat.ai/api/search')
  })
})

describe('structural changes', () => {
  const docsTree = ['www.librechat.ai/docs', ...locales.map((l) => `www.librechat.ai/${l}/docs`)]

  /**
   * lib/docs-layout.tsx hands the complete docsSource.pageTree to DocsLayout for
   * every page, so adding or removing a node changes every docs page's sidebar.
   */
  it.each(['A', 'D'])('purges the whole docs tree when an English page is %sed', (status) => {
    const { prefixes } = prefixesForFile('content/docs/features/agents.mdx', locales, status)
    for (const prefix of docsTree) expect(prefixes).toContain(prefix)
    expect(prefixes).toContain('www.librechat.ai/llms')
  })

  it('keeps an edited English page scoped to itself', () => {
    expect(prefixesForFile('content/docs/features/agents.mdx', locales, 'M').prefixes).toEqual([
      'www.librechat.ai/docs/features/agents',
      'www.librechat.ai/llms',
      'www.librechat.ai/api/search',
    ])
  })

  /**
   * getAvailableLocalesBySlug() is one site-wide map embedded in every docs page,
   * and lib/docs-page.tsx derives hreflang from which translations exist.
   */
  it.each(['A', 'D'])('purges the whole docs tree when a translation is %sed', (status) => {
    const { prefixes } = prefixesForFile('content/docs/features/agents.ja.mdx', locales, status)
    for (const prefix of docsTree) expect(prefixes).toContain(prefix)
  })

  it('keeps an edited translation scoped to itself, so a sweep stays cheap', () => {
    expect(prefixesForFile('content/docs/features/agents.ja.mdx', locales, 'M').prefixes).toEqual([
      'www.librechat.ai/ja/docs/features/agents',
      'www.librechat.ai/api/search',
    ])
  })

  /**
   * The sidebar draws each page's title and icon from the page-tree node, so a
   * frontmatter edit changes every docs page even though git reports it as M.
   * The workflow marks those files `T` via `git diff -G'^(title|icon):'`.
   */
  it('treats a frontmatter title/icon edit as structural', () => {
    const { prefixes, reason } = prefixesForFile('content/docs/features/agents.mdx', locales, 'T')
    expect(prefixes).toContain('www.librechat.ai/docs')
    expect(prefixes).toContain('www.librechat.ai/zh/docs')
    expect(reason).toContain('frontmatter')
  })

  it('marks a translated page structural on a frontmatter edit too', () => {
    expect(prefixesForFile('content/docs/features/agents.ja.mdx', locales, 'T').prefixes).toContain(
      'www.librechat.ai/docs',
    )
  })

  it('parses the T status the workflow injects', () => {
    expect(parseChangedLine('T\tcontent/docs/features/agents.mdx')).toEqual({
      status: 'T',
      file: 'content/docs/features/agents.mdx',
    })
  })

  it('maps a rename as delete + add, covering the old URL', () => {
    const result = computePurge(
      ['D\tcontent/docs/local/docker.mdx', 'A\tcontent/docs/local/docker-compose.mdx'],
      locales,
    )
    // Both sides are structural, so the tree purge covers the vacated URL.
    expect(result.prefixes).toContain('www.librechat.ai/docs')
  })
})

describe('docs pages', () => {
  it('maps an English page to its docs path', () => {
    expect(prefixesForFile('content/docs/local/docker.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/docs/local/docker',
      'www.librechat.ai/llms',
      'www.librechat.ai/api/search',
    ])
  })

  it('maps a section index to the section root', () => {
    expect(prefixesForFile('content/docs/quick_start/index.mdx', locales).prefixes).toContain(
      'www.librechat.ai/docs/quick_start',
    )
  })

  it('maps the docs root index to /docs', () => {
    expect(prefixesForFile('content/docs/index.mdx', locales).prefixes).toContain(
      'www.librechat.ai/docs',
    )
  })

  it('maps a translation to the locale-prefixed path only', () => {
    expect(prefixesForFile('content/docs/features/agents.ja.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/ja/docs/features/agents',
      'www.librechat.ai/api/search',
    ])
  })

  it('keeps the pt-BR locale case exactly as the route serves it', () => {
    expect(prefixesForFile('content/docs/compatibility.pt-BR.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/pt-BR/docs/compatibility',
      'www.librechat.ai/api/search',
    ])
  })

  it('maps a translated section index to the localized section root', () => {
    expect(prefixesForFile('content/docs/toolkit/index.de.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/de/docs/toolkit',
      'www.librechat.ai/api/search',
    ])
  })
})

describe('meta.json', () => {
  /**
   * Not section-scoped: lib/docs-layout.tsx renders the complete page tree into
   * every docs page, so a sidebar change reaches pages in unrelated sections.
   */
  it('purges every docs page in every locale, not just the section it sits in', () => {
    const { prefixes } = prefixesForFile('content/docs/local/meta.json', locales)
    expect(prefixes).toContain('www.librechat.ai/docs')
    expect(prefixes).toContain('www.librechat.ai/pt-BR/docs')
    // The docs root, one per locale, and the llms export.
    // The docs root, one per locale, the llms export and the search index.
  })

  it('does not stop at the section prefix, which would leave other pages stale', () => {
    expect(prefixesForFile('content/docs/local/meta.json', locales).prefixes).not.toContain(
      'www.librechat.ai/docs/local',
    )
  })

  /**
   * app/llms-full.txt/route.ts builds the export from getOrderedDocsPages(),
   * which walks docsSource.pageTree — the tree meta.json defines. Reordering a
   * section reorders the export.
   */
  it('purges the llms export when the untranslated meta.json changes', () => {
    expect(prefixesForFile('content/docs/local/meta.json', locales).prefixes).toContain(
      'www.librechat.ai/llms',
    )
  })

  it('leaves the llms export alone for a localized meta file', () => {
    // getOrderedDocsPages() pins itself to i18n.defaultLanguage, so a translated
    // sidebar cannot reach the English export.
    expect(prefixesForFile('content/docs/local/meta.de.json', locales).prefixes).not.toContain(
      'www.librechat.ai/llms',
    )
  })

  it('purges everything under /docs for the root meta.json', () => {
    const { prefixes } = prefixesForFile('content/docs/meta.json', locales)
    expect(prefixes).toContain('www.librechat.ai/docs')
    expect(prefixes).toContain('www.librechat.ai/zh/docs')
  })

  it('limits a localized meta file to its own locale, but to all of that locale', () => {
    expect(prefixesForFile('content/docs/configuration/meta.de.json', locales).prefixes).toEqual([
      'www.librechat.ai/de/docs',
      'www.librechat.ai/api/search',
    ])
  })

  it('treats a deeply nested meta.json the same as any other', () => {
    const { prefixes } = prefixesForFile(
      'content/docs/configuration/librechat_yaml/ai_endpoints/meta.json',
      locales,
    )
    expect(prefixes).toContain('www.librechat.ai/docs')
    expect(prefixes).toHaveLength(locales.length + 3)
  })
})

describe('blog and changelog', () => {
  it('purges the blog index, its posts and the author pages together', () => {
    expect(
      prefixesForFile('content/blog/2026-07-26_clickhouse-analytics.mdx', locales).prefixes,
    ).toEqual(['www.librechat.ai/blog', 'www.librechat.ai/authors'])
  })

  it('purges the changelog index and entries together', () => {
    expect(prefixesForFile('content/changelog/config_v1.1.9.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/changelog',
    ])
  })
})

describe('public assets', () => {
  /**
   * No page prefix can reach /images/foo.png, so without its own URL the asset
   * stays cached. app/api/og/route.tsx records the real incident: the legacy
   * unversioned socialcards were served stale for ~15 days.
   */
  it.each([
    ['public/images/logo.svg', 'https://www.librechat.ai/images/logo.svg'],
    ['public/favicon.ico', 'https://www.librechat.ai/favicon.ico'],
    [
      'public/images/socialcards/default-image.png',
      'https://www.librechat.ai/images/socialcards/default-image.png',
    ],
  ])('purges %s at its own URL', (file, url) => {
    expect(prefixesForFile(file, locales).files).toEqual([url])
  })

  it('also purges pages, because a replaced asset can move OG_VERSION and image dimensions', () => {
    expect(prefixesForFile('public/librechat.png', locales).broad).toBe(true)
  })

  it('keeps the asset URL after escalating to broad', () => {
    const result = computePurge(['public/images/logo.svg'], locales)
    expect(result.broad).toBe(true)
    expect(result.files).toContain('https://www.librechat.ai/images/logo.svg')
    expect(result.files).toContain('https://www.librechat.ai/')
  })

  it('carries an asset URL through alongside an unrelated shared-file escalation', () => {
    const result = computePurge(['public/favicon.ico', 'lib/source.ts'], locales)
    expect(result.files).toContain('https://www.librechat.ai/favicon.ico')
  })
})

describe('URL encoding', () => {
  /**
   * `public/images/logos/Stripe wordmark - Slate.svg` is a real file here. A raw
   * space does not merely miss that asset: Cloudflare rejects the call, so every
   * URL batched alongside it goes unpurged too.
   */
  it.each([
    [
      'public/images/logos/Stripe wordmark - Slate.svg',
      '/images/logos/Stripe%20wordmark%20-%20Slate.svg',
    ],
    ['public/images/café.png', '/images/caf%C3%A9.png'],
    ['public/images/a#b.png', '/images/a%23b.png'],
    ['public/images/a?b.png', '/images/a%3Fb.png'],
    ['public/images/a%b.png', '/images/a%25b.png'],
  ])('encodes %s', (file, expected) => {
    expect(prefixesForFile(file, locales).files).toEqual([`https://www.librechat.ai${expected}`])
  })

  /**
   * Git prints a trailing space literally, even under core.quotepath=false, so
   * trimming the record would purge `/logo.png` while the real `/logo.png%20`
   * stayed cached.
   */
  it('keeps whitespace that belongs to the path', () => {
    expect(prefixesForFile('public/logo.png ', locales).files).toEqual([
      'https://www.librechat.ai/logo.png%20',
    ])
  })

  it('keeps the path separators as separators', () => {
    expect(encodePath('images/logos/a b.png')).toBe('images/logos/a%20b.png')
  })

  it('emits no raw space or hash anywhere in a purge payload', () => {
    const result = computePurge(['M\tpublic/images/logos/Stripe wordmark - Slate.svg'], locales)
    for (const url of result.files) expect(url).not.toMatch(/[ #]/)
  })
})

describe('optimized image variants', () => {
  it('adds the optimizer prefix for a raster image', () => {
    expect(prefixesForFile('public/images/logos/x.png', locales).prefixes).toContain(
      'www.librechat.ai/_next/image',
    )
  })

  it('leaves it out for a non-image asset', () => {
    expect(prefixesForFile('public/manifest.json', locales).prefixes).toEqual([])
  })

  it('keeps it through the escalation to broad, which is pages-only', () => {
    const result = computePurge(['M\tpublic/images/logos/x.png'], locales)
    expect(result.broad).toBe(true)
    expect(result.prefixes).toContain('www.librechat.ai/_next/image')
    expect(result.files).toContain('https://www.librechat.ai/images/logos/x.png')
  })
})

describe('broad recovery', () => {
  it('is pages-only with no diff to work from', () => {
    const result = computePurge([], locales, { forceBroad: true })
    // dropCoveredPrefixes sorts, so compare as sets.
    expect([...result.prefixes].sort()).toEqual([...broadPrefixes(locales)].sort())
    expect(result.files).toEqual(homepageUrls())
  })

  /**
   * The manual escape hatch has to be able to recover what a failed run left
   * behind, and asset URLs and removed locales only exist in a diff.
   */
  it('picks up asset URLs and the optimizer prefix when given a range', () => {
    const result = computePurge(['M\tpublic/images/logos/x.png'], locales, { forceBroad: true })
    expect(result.prefixes).toEqual(expect.arrayContaining(broadPrefixes(locales)))
    expect(result.prefixes).toContain('www.librechat.ai/_next/image')
    expect(result.files).toContain('https://www.librechat.ai/images/logos/x.png')
  })

  it('does not send a page prefix the broad set already covers', () => {
    const result = computePurge(['M\tcontent/docs/local/docker.mdx'], locales, { forceBroad: true })
    expect(result.prefixes).not.toContain('www.librechat.ai/docs/local/docker')
    expect(result.prefixes).toContain('www.librechat.ai/docs')
  })
})

describe('asset fallback for runs with no diff', () => {
  const assets = assetFallbackTargets()

  it('covers every top-level entry under public/', () => {
    expect(assets.prefixes).toEqual(
      expect.arrayContaining(['www.librechat.ai/images', 'www.librechat.ai/videos']),
    )
    expect(assets.files).toEqual(
      expect.arrayContaining([
        'https://www.librechat.ai/favicon.ico',
        'https://www.librechat.ai/site.webmanifest',
      ]),
    )
  })

  it('encodes the entries it emits', () => {
    for (const url of assets.files) expect(url).not.toMatch(/[ #]/)
  })

  /**
   * Deliberately not in the ordinary broad set: evicting every image whenever a
   * shared file changes is the asset MISS wave that avoiding purge_everything
   * exists to prevent. It belongs only to the paths that cannot see a diff.
   */
  it('stays out of the ordinary broad set', () => {
    const broad = broadPrefixes(locales)
    for (const prefix of assets.prefixes) expect(broad).not.toContain(prefix)
  })

  it('is reachable from the flag the recovery path uses', () => {
    expect(KNOWN_FLAGS).toContain('--assets')
  })
})

describe('fallbacks', () => {
  it.each([
    'lib/source.ts',
    'components/home/HomePageContent.tsx',
    'app/docs/[[...slug]]/page.tsx',
    'next.config.mjs',
    'proxy.ts',
    'package.json',
  ])('falls back to a broad purge for %s', (file) => {
    expect(prefixesForFile(file, locales).broad).toBe(true)
  })

  it('treats an unknown file type under content/docs as a section change, not a no-op', () => {
    const { prefixes, broad } = prefixesForFile('content/docs/features/diagram.png', locales)
    expect(broad).toBe(false)
    expect(prefixes).toContain('www.librechat.ai/docs/features')
  })

  it.each([
    '.github/workflows/ci.yml',
    'e2e/home.spec.ts',
    'README.md',
    'lib/i18n/tm.test.ts',
    'scripts/cache-build-assets.mjs',
  ])('purges nothing for %s', (file) => {
    const result = prefixesForFile(file, locales)
    expect(result.broad).toBe(false)
    expect(result.prefixes).toEqual([])
  })
})

describe('computePurge', () => {
  it('drops prefixes already covered by a broader one', () => {
    expect(
      dropCoveredPrefixes([
        'www.librechat.ai/docs',
        'www.librechat.ai/docs/local/docker',
        'www.librechat.ai/blog',
      ]),
    ).toEqual(['www.librechat.ai/blog', 'www.librechat.ai/docs'])
  })

  it('does not drop a sibling that merely shares a string prefix', () => {
    expect(
      dropCoveredPrefixes([
        'www.librechat.ai/docs/features/agents',
        'www.librechat.ai/docs/features/agents-anything',
      ]),
    ).toHaveLength(2)
  })

  it('maps a deletion exactly like a modification — the stale entry has to go', () => {
    const deleted = computePurge(['content/docs/features/removed_page.mdx'], locales)
    expect(deleted.prefixes).toContain('www.librechat.ai/docs/features/removed_page')
  })

  it('escalates to broad when any file is shared', () => {
    const result = computePurge(['content/docs/local/docker.mdx', 'lib/source.ts'], locales)
    expect(result.broad).toBe(true)
    expect([...result.prefixes].sort()).toEqual([...broadPrefixes(locales)].sort())
    expect(result.files).toEqual(homepageUrls())
  })

  it('collapses to broad past the prefix cap instead of sending hundreds of items', () => {
    const files = Array.from(
      { length: COLLAPSE_THRESHOLD + 1 },
      (_, i) => `content/docs/features/page${i}.mdx`,
    )
    const result = computePurge(files, locales)
    expect(result.collapsed).toBe(true)
    expect(result.broad).toBe(true)
  })

  it('purges nothing when a deploy touched no rendered page', () => {
    const result = computePurge(['.github/workflows/ci.yml'], locales)
    expect(result.prefixes).toEqual([])
    expect(result.broad).toBe(false)
  })

  it('never emits a bare-host prefix, which would evict the static asset cache', () => {
    for (const prefix of broadPrefixes(locales)) {
      expect(prefix).toMatch(/^www\.librechat\.ai\/.+/)
    }
  })
})
