import { describe, expect, it } from 'vitest'
import { canonicalDocsPath, canonicalSameOriginPath } from '@/lib/safe-docs-path'

describe('canonicalDocsPath', () => {
  it('accepts the docs root and descendants', () => {
    expect(canonicalDocsPath('/docs')).toBe('/docs')
    expect(canonicalDocsPath('/docs/features')).toBe('/docs/features')
    expect(canonicalDocsPath('/docs/configuration/librechat_yaml')).toBe(
      '/docs/configuration/librechat_yaml',
    )
  })

  it('preserves the query string and fragment', () => {
    expect(canonicalDocsPath('/docs/features?tab=1#section')).toBe('/docs/features?tab=1#section')
  })

  it('returns the canonical form, not the value it was given', () => {
    expect(canonicalDocsPath('/./docs/features')).toBe('/docs/features')
    expect(canonicalDocsPath('/docs/nested/../features')).toBe('/docs/features')
    expect(canonicalDocsPath('/docs\t/features')).toBe('/docs/features')
    expect(canonicalDocsPath('/\tdocs/features')).toBe('/docs/features')
  })

  it('rejects protocol-relative and backslash authorities', () => {
    expect(canonicalDocsPath('//evil.com')).toBeNull()
    expect(canonicalDocsPath('/\\evil.com')).toBeNull()
  })

  it('rejects control-character tricks the browser would normalize', () => {
    expect(canonicalDocsPath('/\t/evil.com')).toBeNull()
    expect(canonicalDocsPath('/\n/evil.com')).toBeNull()
  })

  it('rejects dot-segment traversal out of /docs', () => {
    expect(canonicalDocsPath('/docs/%2e%2e/privacy')).toBeNull()
    expect(canonicalDocsPath('/docs/../privacy')).toBeNull()
    expect(canonicalDocsPath('/docs/../../evil')).toBeNull()
    expect(canonicalDocsPath('/docs\\..\\privacy')).toBeNull()
  })

  it('rejects encoded path separators a downstream proxy might decode', () => {
    // The URL parser leaves these encoded, so the pathname still looks like it
    // sits under /docs — but a layer that decodes %2f first would resolve the
    // `..` and land on /privacy.
    expect(canonicalDocsPath('/docs/..%2fprivacy')).toBeNull()
    expect(canonicalDocsPath('/docs/..%2Fprivacy')).toBeNull()
    expect(canonicalDocsPath('/docs/%2e%2e%2fprivacy')).toBeNull()
    expect(canonicalDocsPath('/docs/..%5cprivacy')).toBeNull()
  })

  it('allows encoded separators in the query, which cannot move the path', () => {
    expect(canonicalDocsPath('/docs/features?redirect=%2fprivacy')).toBe(
      '/docs/features?redirect=%2fprivacy',
    )
  })

  it('rejects schemes and non-docs paths', () => {
    expect(canonicalDocsPath('javascript:alert(1)')).toBeNull()
    expect(canonicalDocsPath('https://evil.com')).toBeNull()
    expect(canonicalDocsPath('/privacy')).toBeNull()
    expect(canonicalDocsPath('/docsevil')).toBeNull()
    expect(canonicalDocsPath('/DOCS/features')).toBeNull()
  })

  it('rejects non-string input', () => {
    expect(canonicalDocsPath(undefined)).toBeNull()
    expect(canonicalDocsPath(null)).toBeNull()
    expect(canonicalDocsPath(42)).toBeNull()
  })
})

describe('canonicalSameOriginPath', () => {
  it('accepts any same-origin path, not just /docs', () => {
    expect(canonicalSameOriginPath('/privacy')).toBe('/privacy')
    expect(canonicalSameOriginPath('/fr/docs/features')).toBe('/fr/docs/features')
    expect(canonicalSameOriginPath('/blog?page=2#top')).toBe('/blog?page=2#top')
  })

  it('canonicalizes dot segments and stripped control characters', () => {
    expect(canonicalSameOriginPath('/./blog')).toBe('/blog')
    expect(canonicalSameOriginPath('/blog/../privacy')).toBe('/privacy')
    expect(canonicalSameOriginPath('/blo\tg')).toBe('/blog')
  })

  it('rejects anything that resolves to another origin', () => {
    expect(canonicalSameOriginPath('//evil.com')).toBeNull()
    expect(canonicalSameOriginPath('/\\evil.com')).toBeNull()
    expect(canonicalSameOriginPath('/\t/evil.com')).toBeNull()
    expect(canonicalSameOriginPath('https://evil.com')).toBeNull()
    expect(canonicalSameOriginPath('javascript:alert(1)')).toBeNull()
  })

  it('rejects values that are not rooted paths', () => {
    expect(canonicalSameOriginPath('mailto:a@b.com')).toBeNull()
    expect(canonicalSameOriginPath('#anchor')).toBeNull()
    expect(canonicalSameOriginPath('relative/path')).toBeNull()
  })

  it('rejects non-string input', () => {
    expect(canonicalSameOriginPath(undefined)).toBeNull()
    expect(canonicalSameOriginPath(null)).toBeNull()
    expect(canonicalSameOriginPath({})).toBeNull()
  })
})
