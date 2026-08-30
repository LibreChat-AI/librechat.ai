import { describe, expect, it } from 'vitest'
import { createRequire } from 'node:module'
import nextConfig from '../next.config.mjs'

// Next's bundled path-to-regexp ships no types, so require it rather than
// import it. Using Next's own copy is the point: these assertions then test the
// matching Next will actually perform on a header rule, not a re-implementation.
const require = createRequire(import.meta.url)
const { pathToRegexp } = require('next/dist/compiled/path-to-regexp') as {
  pathToRegexp: (source: string) => RegExp | { regexp: RegExp }
}

interface Redirect {
  source: string
  destination: string
  permanent: boolean
}

interface HeaderRule {
  source: string
  headers: { key: string; value: string }[]
  has?: unknown
  missing?: unknown
}

const redirects = async (): Promise<Redirect[]> =>
  (await (nextConfig as { redirects: () => Promise<Redirect[]> }).redirects()) ?? []

const headerRules = (): HeaderRule[] =>
  (nextConfig as unknown as { headers: () => HeaderRule[] }).headers() ?? []

const find = (all: Redirect[], source: string) => all.find((r) => r.source === source)

describe('redirects', () => {
  it('makes every on-site content move permanent', async () => {
    const all = await redirects()

    for (const source of [
      '/features',
      '/docs/configuration/azure',
      '/docs/user_guides/artifacts',
      '/docs/user_guides/plugins',
      '/docs/features/plugins',
      '/docs/features/speech-to-text',
      '/docs/configuration/librechat_yaml/setup',
    ]) {
      expect(find(all, source), `missing redirect for ${source}`).toBeDefined()
      expect(find(all, source)?.permanent, `${source} should be permanent`).toBe(true)
    }
  })

  it('keeps external shortcuts and rotating targets temporary', async () => {
    const all = await redirects()

    for (const source of ['/discord', '/demo', '/issue', '/issues', '/gh-discussions']) {
      expect(find(all, source)?.permanent, `${source} should stay temporary`).toBe(false)
    }
    // /roadmap points at whichever roadmap post is current; a 308 would have
    // browsers cache a link to a stale year's post.
    expect(find(all, '/roadmap')?.permanent).toBe(false)
  })

  it('sends every toolkit alias straight to its docs page in one hop', async () => {
    const all = await redirects()
    const expected: Record<string, string> = {
      '/toolkit': '/docs/toolkit',
      '/toolkit/yaml-checker': '/docs/toolkit/yaml-validator',
      '/toolkit/yaml_checker': '/docs/toolkit/yaml-validator',
      '/toolkit/creds-generator': '/docs/toolkit/credentials-generator',
      '/toolkit/creds_generator': '/docs/toolkit/credentials-generator',
    }

    for (const [source, destination] of Object.entries(expected)) {
      expect(find(all, source)?.destination, `${source} should reach ${destination}`).toBe(
        destination,
      )
      expect(find(all, source)?.permanent).toBe(true)
    }
  })

  it('leaves no redirect whose destination is itself a redirect source', async () => {
    const all = await redirects()
    const sources = new Set(all.map((r) => r.source))

    for (const redirect of all) {
      expect(
        sources.has(redirect.destination),
        `${redirect.source} chains via ${redirect.destination}`,
      ).toBe(false)
    }
  })
})

describe('X-Robots-Tag', () => {
  const noindexSources = () =>
    headerRules()
      .filter((rule) =>
        rule.headers.some((h) => h.key === 'X-Robots-Tag' && h.value.includes('noindex')),
      )
      .map((rule) => rule.source)

  it.each([
    '/llms.txt',
    '/llms-full.txt',
    '/llms.mdx/:path*',
    '/docs/:path*.md',
    '/docs/:path*.mdx',
    '/auth.md',
    '/openapi.json',
  ])('marks the markdown/LLM endpoint %s noindex', (source) => {
    expect(noindexSources()).toContain(source)
  })

  const matchesANoindexRule = (requestPath: string) =>
    noindexSources().some((source) => {
      const compiled = pathToRegexp(source)
      const regexp = compiled instanceof RegExp ? compiled : compiled.regexp
      return regexp.test(requestPath)
    })

  it.each(['/llms.txt', '/docs/quick_start.md', '/docs/a/b.mdx', '/llms.mdx/docs/quick_start'])(
    'marks the request path %s noindex',
    (requestPath) => {
      expect(matchesANoindexRule(requestPath)).toBe(true)
    },
  )

  it.each([
    '/',
    '/docs',
    '/docs/quick_start',
    '/es/docs/quick_start',
    // A docs page whose slug merely ends in "mdx" must not be caught by the
    // /docs/:path*.mdx rule.
    '/docs/features/mdx',
    '/blog/2026-07-26_clickhouse-analytics',
  ])('leaves the reader-facing path %s indexable', (requestPath) => {
    expect(matchesANoindexRule(requestPath)).toBe(false)
  })

  it('never keys a noindex rule on the docs path itself', () => {
    // The Accept-negotiated Markdown variant of /docs/* is served by rewriting
    // to /llms.mdx/*, so it must not be reachable through a rule keyed on the
    // docs path — that would noindex the HTML page readers and Google see.
    for (const source of noindexSources()) {
      expect(source).not.toBe('/docs/:path*')
      expect(source).not.toBe('/:path*')
    }
  })

  it('leaves the docs cache rules untouched', () => {
    const docsCacheRule = headerRules().find(
      (rule) =>
        rule.source === '/docs/:path*' &&
        rule.headers.some((h) => h.key === 'Cache-Control' && h.value.startsWith('public')),
    )
    expect(docsCacheRule).toBeDefined()
  })
})
