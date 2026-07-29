/**
 * Same-origin URL canonicalization for links and navigation targets that
 * originate from model output, shared payloads, or request headers.
 *
 * Everything here resolves the value with the URL parser against a fixed base
 * before inspecting it, so tricks the browser would later normalize cannot slip
 * past a prefix check: protocol-relative authorities (//evil.com, /\evil.com)
 * and injected ASCII control characters (/\t/evil.com -> //evil.com) resolve to
 * a different origin and are rejected. Any `:` scheme fails the leading-slash
 * check.
 *
 * Callers must navigate to the *returned* canonical string rather than the
 * value they passed in — the two differ whenever the parser normalizes away a
 * dot segment or a stripped control character.
 */
const SAME_ORIGIN_BASE = 'https://internal.invalid'

/**
 * Percent-encoded path separators survive the URL parser untouched
 * (`/docs/..%2fprivacy` keeps its `%2f`), but proxies, CDNs, and routers
 * downstream may decode them and only then resolve the `..`. Rather than guess
 * which layer decodes, reject encoded separators in the pathname outright.
 * Query strings are unaffected — they cannot move the path.
 */
const ENCODED_PATH_SEPARATOR = /%2f|%5c/i

function parseSameOrigin(url: unknown): URL | null {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
    return null
  }

  let parsed: URL
  try {
    parsed = new URL(url, SAME_ORIGIN_BASE)
  } catch {
    return null
  }

  return parsed.origin === SAME_ORIGIN_BASE ? parsed : null
}

function serialize(parsed: URL): string {
  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

/**
 * The canonical form of a same-origin path (any pathname), or null if `url`
 * escapes the origin. Use for in-app links that are not restricted to /docs.
 */
export function canonicalSameOriginPath(url: unknown): string | null {
  const parsed = parseSameOrigin(url)
  return parsed ? serialize(parsed) : null
}

/**
 * The canonical form of a documentation path — the /docs root
 * (content/docs/index.mdx) or a descendant (/docs/...) — or null if `url`
 * escapes that allowlist.
 */
export function canonicalDocsPath(url: unknown): string | null {
  const parsed = parseSameOrigin(url)
  if (!parsed) return null
  if (ENCODED_PATH_SEPARATOR.test(parsed.pathname)) return null
  if (parsed.pathname !== '/docs' && !parsed.pathname.startsWith('/docs/')) return null
  return serialize(parsed)
}
