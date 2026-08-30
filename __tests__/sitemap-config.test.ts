import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sitemapConfig = require('../next-sitemap.config.js')
const {
  contentRoutes,
  docsFile,
  frontmatterDate,
  lastmodFor,
  sourceFileFor,
} = require('../lib/lastmod.cjs')

/**
 * next-sitemap's own exclude matcher: patterns are anchored, case-insensitive,
 * and `*` is the only wildcard (it becomes `[\s\S]*`). Mirrored here so the
 * exclude list is tested against the semantics that actually apply at build
 * time rather than against a glob library we don't use.
 */
function isExcluded(route: string): boolean {
  return (sitemapConfig.exclude as string[]).some((pattern) =>
    new RegExp(
      `^${pattern
        .replaceAll(/[|\\{}()[\]^$+?.]/g, '\\$&')
        .replaceAll('-', '\\x2d')
        .replaceAll('*', '[\\s\\S]*')}$`,
      'i',
    ).test(route),
  )
}

describe('robots.txt Content-Signal', () => {
  it('opts in to AI training, search, and AI input', async () => {
    const robotsTxt = await sitemapConfig.robotsTxtOptions.transformRobotsTxt(
      sitemapConfig,
      'User-agent: *\nAllow: /\n',
    )

    expect(robotsTxt).toContain('Content-Signal: ai-train=yes, search=yes, ai-input=yes')
    expect(robotsTxt).not.toContain('ai-train=no')
  })
})

describe('sitemap exclusions', () => {
  it.each([
    '/toolkit',
    '/toolkit/yaml-checker',
    '/toolkit/creds_generator',
    '/llms.txt',
    '/llms-full.txt',
    '/llms.mdx/docs/quick_start',
    '/docs/quick_start.md',
    '/docs/configuration/dotenv.mdx',
    '/auth.md',
    '/openapi.json',
    '/mcp',
    '/.well-known/api-catalog',
    '/api/search/en',
  ])('drops the non-page route %s', (route) => {
    expect(isExcluded(route)).toBe(true)
  })

  it.each([
    '/',
    '/docs',
    '/docs/quick_start',
    '/es/docs/quick_start',
    '/blog/2026-07-26_clickhouse-analytics',
    '/changelog',
    '/authors/danny-avila',
    '/demo/privacy',
  ])('keeps the reader-facing route %s', (route) => {
    expect(isExcluded(route)).toBe(false)
  })

  it('does not exclude a docs page whose slug merely contains "md"', () => {
    expect(isExcluded('/docs/features/mdx')).toBe(false)
  })
})

describe('sitemap transform', () => {
  it('emits a bare loc with no changefreq or priority', async () => {
    const entry = await sitemapConfig.transform(sitemapConfig, '/docs/quick_start')

    expect(entry.loc).toBe('/docs/quick_start')
    expect(entry).not.toHaveProperty('changefreq')
    expect(entry).not.toHaveProperty('priority')
  })

  it('never stamps the current time as lastmod', async () => {
    const before = Date.now()
    const entry = await sitemapConfig.transform(sitemapConfig, '/docs/quick_start')

    if (entry.lastmod !== undefined) {
      // A real date comes from a commit or frontmatter, so it predates this run.
      expect(new Date(entry.lastmod).getTime()).toBeLessThan(before)
    }
  })
})

describe('lastmod source resolution', () => {
  it('resolves an English docs leaf page to its MDX file', () => {
    expect(sourceFileFor('/docs/configuration/dotenv')).toBe(
      'content/docs/configuration/dotenv.mdx',
    )
  })

  it('resolves a section root to its index file', () => {
    expect(sourceFileFor('/docs/features')).toBe('content/docs/features/index.mdx')
  })

  it('resolves the docs root', () => {
    expect(sourceFileFor('/docs')).toBe('content/docs/index.mdx')
  })

  it('resolves a localized docs page to the translated file', () => {
    expect(sourceFileFor('/es/docs/configuration/dotenv')).toBe(
      'content/docs/configuration/dotenv.es.mdx',
    )
  })

  it('resolves a localized section root to the translated index', () => {
    expect(sourceFileFor('/de/docs/features')).toBe('content/docs/features/index.de.mdx')
  })

  it('returns nothing for a locale that has no translation of the page', () => {
    expect(docsFile('configuration/dotenv', 'xx')).toBeUndefined()
  })

  it('resolves app-router pages to their page file', () => {
    expect(sourceFileFor('/')).toBe('app/page.tsx')
    expect(sourceFileFor('/about')).toBe('app/about/page.tsx')
    expect(sourceFileFor('/demo/terms')).toBe('app/demo/terms/page.tsx')
  })

  it('ignores a trailing slash and any query or fragment', () => {
    expect(sourceFileFor('/docs/configuration/dotenv/')).toBe(
      'content/docs/configuration/dotenv.mdx',
    )
    expect(sourceFileFor('/docs/configuration/dotenv?x=1#y')).toBe(
      'content/docs/configuration/dotenv.mdx',
    )
  })

  it('returns nothing for a route with no single source file', () => {
    expect(sourceFileFor('/docs/does-not-exist')).toBeUndefined()
    expect(sourceFileFor('/toolkit')).toBeUndefined()
  })
})

describe('lastmod values', () => {
  it('falls back to frontmatter for blog posts when git history is unavailable', () => {
    const file = sourceFileFor('/blog/2026-07-26_clickhouse-analytics')
    expect(file).toBe('content/blog/2026-07-26_clickhouse-analytics.mdx')

    const date = frontmatterDate(file)
    expect(date).toBeDefined()
    expect(new Date(date).getFullYear()).toBe(2026)
  })

  it('gives a blog post a lastmod even on a shallow checkout', () => {
    expect(lastmodFor('/blog/2026-07-26_clickhouse-analytics')).toBeDefined()
  })

  it('omits lastmod rather than inventing one for an unknown route', () => {
    expect(lastmodFor('/docs/does-not-exist')).toBeUndefined()
  })

  it('returns an ISO-8601 date when it returns anything at all', () => {
    for (const route of ['/', '/docs', '/docs/quick_start', '/blog', '/changelog']) {
      const value = lastmodFor(route)
      if (value !== undefined) expect(Number.isNaN(Date.parse(value))).toBe(false)
    }
  })
})

describe('content routes', () => {
  it('lists every blog and changelog entry from the content directory', () => {
    const routes: string[] = contentRoutes()

    expect(routes).toContain('/blog/2026-07-26_clickhouse-analytics')
    expect(routes).toContain('/blog/2026-02-18_2026_roadmap')
    expect(routes.some((route) => route.startsWith('/changelog/'))).toBe(true)
    expect(routes.every((route) => /^\/(blog|changelog)\/[^/]+$/.test(route))).toBe(true)
  })

  it('lists the post that renders dynamically and so misses the prerender manifest', async () => {
    // /blog/2026-07-26_clickhouse-analytics embeds live data via connection(),
    // which forces dynamic rendering and drops it from Next's prerender
    // manifest — the sole source next-sitemap would otherwise read.
    const route = '/blog/2026-07-26_clickhouse-analytics'
    expect(contentRoutes()).toContain(route)

    const additional = await sitemapConfig.additionalPaths(sitemapConfig)
    expect(additional.map((entry: { loc: string }) => entry.loc)).toContain(route)
  })

  it('gives every additional path the same shape as a transformed route', async () => {
    const additional = await sitemapConfig.additionalPaths(sitemapConfig)

    for (const entry of additional) {
      expect(entry).toHaveProperty('loc')
      expect(entry).not.toHaveProperty('changefreq')
      expect(entry).not.toHaveProperty('priority')
    }
  })
})
