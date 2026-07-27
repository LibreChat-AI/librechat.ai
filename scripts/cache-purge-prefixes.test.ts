import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  COLLAPSE_THRESHOLD,
  KNOWN_FLAGS,
  broadPrefixes,
  computePurge,
  dropCoveredPrefixes,
  homepageUrls,
  parseArgs,
  prefixesForFile,
  readLocales,
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
})

describe('parseArgs', () => {
  it('accepts exactly the three documented flags', () => {
    expect(KNOWN_FLAGS).toEqual(['--broad', '--json', '--explain'])
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
      'Unknown flag: --deleted\nKnown flags: --broad, --json, --explain',
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

describe('docs pages', () => {
  it('maps an English page to its docs path', () => {
    expect(prefixesForFile('content/docs/local/docker.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/docs/local/docker',
      'www.librechat.ai/llms',
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
    ])
  })

  it('keeps the pt-BR locale case exactly as the route serves it', () => {
    expect(prefixesForFile('content/docs/compatibility.pt-BR.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/pt-BR/docs/compatibility',
    ])
  })

  it('maps a translated section index to the localized section root', () => {
    expect(prefixesForFile('content/docs/toolkit/index.de.mdx', locales).prefixes).toEqual([
      'www.librechat.ai/de/docs/toolkit',
    ])
  })
})

describe('meta.json', () => {
  it('purges a section in every locale, because it drives sidebar and ordering', () => {
    const { prefixes } = prefixesForFile('content/docs/local/meta.json', locales)
    expect(prefixes).toContain('www.librechat.ai/docs/local')
    expect(prefixes).toContain('www.librechat.ai/pt-BR/docs/local')
    // English + one per locale + the llms export.
    expect(prefixes).toHaveLength(locales.length + 2)
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

  it('limits a localized meta file to its own locale', () => {
    expect(prefixesForFile('content/docs/configuration/meta.de.json', locales).prefixes).toEqual([
      'www.librechat.ai/de/docs/configuration',
    ])
  })

  it('handles a deeply nested section', () => {
    const { prefixes } = prefixesForFile(
      'content/docs/configuration/librechat_yaml/ai_endpoints/meta.json',
      locales,
    )
    expect(prefixes).toContain('www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints')
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

  it.each(['.github/workflows/ci.yml', 'e2e/home.spec.ts', 'README.md', 'lib/i18n/tm.test.ts'])(
    'purges nothing for %s',
    (file) => {
      const result = prefixesForFile(file, locales)
      expect(result.broad).toBe(false)
      expect(result.prefixes).toEqual([])
    },
  )
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
    expect(result.prefixes).toEqual(broadPrefixes(locales))
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
