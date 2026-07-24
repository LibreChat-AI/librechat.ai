/**
 * True when `url` is a same-origin documentation path: the /docs root
 * (content/docs/index.mdx) or a descendant (/docs/...).
 *
 * The value is canonicalized with the URL parser against a fixed base before
 * the prefix is checked, so tricks the browser would later normalize cannot
 * escape the allowlist: protocol-relative authorities (//evil.com, /\evil.com),
 * percent-encoded traversal (/docs/%2e%2e/privacy -> /privacy), and injected
 * ASCII control characters (/\t/evil.com -> //evil.com) all resolve to a
 * different origin or a pathname outside /docs and are rejected. Any `:` scheme
 * fails the leading-slash check.
 */
const DOCS_BASE = 'https://docs.invalid'

export function isSafeDocsPath(url: unknown): url is string {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
    return false
  }

  let parsed: URL
  try {
    parsed = new URL(url, DOCS_BASE)
  } catch {
    return false
  }

  if (parsed.origin !== DOCS_BASE) return false
  return parsed.pathname === '/docs' || parsed.pathname.startsWith('/docs/')
}
