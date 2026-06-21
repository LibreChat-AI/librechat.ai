import { describe, it, expect } from 'vitest'
import { localizeDocsHref } from './localize-href'

describe('localizeDocsHref', () => {
  it('prefixes internal /docs links with the active non-default locale', () => {
    expect(localizeDocsHref('/docs/local/docker', '/de/docs/configuration')).toBe(
      '/de/docs/local/docker',
    )
    expect(localizeDocsHref('/docs', '/ja/docs')).toBe('/ja/docs')
  })

  it('leaves links unchanged on the default-language (unprefixed) route', () => {
    expect(localizeDocsHref('/docs/local/docker', '/docs/configuration')).toBe('/docs/local/docker')
  })

  it('does not touch external links, anchors, non-docs paths, or raw markdown', () => {
    expect(localizeDocsHref('https://example.com/docs/x', '/de/docs/x')).toBe(
      'https://example.com/docs/x',
    )
    expect(localizeDocsHref('#section', '/de/docs/x')).toBe('#section')
    expect(localizeDocsHref('/blog/post', '/de/docs/x')).toBe('/blog/post')
    expect(localizeDocsHref('/docs/x.md', '/de/docs/x')).toBe('/docs/x.md')
  })

  it('does not double-prefix an already-localized target', () => {
    // Stored targets are always English /docs, but guard the unexpected case: a
    // /de/docs path is not a /docs path, so it is left alone.
    expect(localizeDocsHref('/de/docs/x', '/de/docs/y')).toBe('/de/docs/x')
  })

  it('ignores an unknown first path segment (e.g. blog)', () => {
    expect(localizeDocsHref('/docs/x', '/blog/some-post')).toBe('/docs/x')
  })
})
