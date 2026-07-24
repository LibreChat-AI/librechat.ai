import { describe, expect, it } from 'vitest'
import { isSafeDocsPath } from '@/lib/safe-docs-path'

describe('isSafeDocsPath', () => {
  it('accepts the docs root and descendants', () => {
    expect(isSafeDocsPath('/docs')).toBe(true)
    expect(isSafeDocsPath('/docs/features')).toBe(true)
    expect(isSafeDocsPath('/docs/configuration/librechat_yaml')).toBe(true)
    expect(isSafeDocsPath('/docs/features?tab=1#section')).toBe(true)
  })

  it('rejects protocol-relative and backslash authorities', () => {
    expect(isSafeDocsPath('//evil.com')).toBe(false)
    expect(isSafeDocsPath('/\\evil.com')).toBe(false)
  })

  it('rejects control-character tricks the browser would normalize', () => {
    expect(isSafeDocsPath('/\t/evil.com')).toBe(false)
    expect(isSafeDocsPath('/\n/evil.com')).toBe(false)
  })

  it('rejects percent-encoded traversal out of /docs', () => {
    expect(isSafeDocsPath('/docs/%2e%2e/privacy')).toBe(false)
    expect(isSafeDocsPath('/docs/../privacy')).toBe(false)
  })

  it('rejects schemes and non-docs paths', () => {
    expect(isSafeDocsPath('javascript:alert(1)')).toBe(false)
    expect(isSafeDocsPath('https://evil.com')).toBe(false)
    expect(isSafeDocsPath('/privacy')).toBe(false)
    expect(isSafeDocsPath('/docsevil')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isSafeDocsPath(undefined)).toBe(false)
    expect(isSafeDocsPath(null)).toBe(false)
    expect(isSafeDocsPath(42)).toBe(false)
  })
})
