import { i18n } from './i18n'

export function isExternalHref(href: string): boolean {
  return href.startsWith('http') || href.startsWith('mailto:')
}

const LEGACY_TOOLKIT_HREFS: Record<string, string> = {
  '/toolkit': '/docs/toolkit',
  '/toolkit/creds-generator': '/docs/toolkit/credentials-generator',
  '/toolkit/creds_generator': '/docs/toolkit/credentials-generator',
  '/toolkit/yaml-checker': '/docs/toolkit/yaml-validator',
  '/toolkit/yaml_checker': '/docs/toolkit/yaml-validator',
}

function canonicalizeDocsHref(href: string): string {
  const match = href.match(/^([^?#]*)([?#].*)?$/)
  const path = match?.[1] ?? href
  const suffix = match?.[2] ?? ''
  const canonicalPath = LEGACY_TOOLKIT_HREFS[path]
  return canonicalPath ? `${canonicalPath}${suffix}` : href
}

/**
 * Prefix an internal `/docs` page link, including legacy `/toolkit` aliases,
 * with the active non-default locale (derived from the current pathname's first
 * segment) so a reader on `/<locale>/docs/...` stays in that locale when
 * following related-guide links and cards.
 *
 * Internal targets are stored byte-for-byte as the English `/docs` route — the
 * translation guard forbids the model from rewriting link targets — so this is the
 * deterministic, render-time locale rewrite applied instead. A target without a
 * translation resolves via the docs route's fallback redirect back to English.
 * Raw-markdown (`.md`/`.mdx`) links, in-page anchors, and external links are left
 * unchanged.
 */
export function localizeDocsHref(href: string, pathname: string): string {
  if (isExternalHref(href)) return href
  const canonicalHref = canonicalizeDocsHref(href)
  if (canonicalHref !== '/docs' && !canonicalHref.startsWith('/docs/')) return canonicalHref
  if (/\.mdx?($|[?#])/.test(canonicalHref)) return canonicalHref
  const seg = pathname.split('/')[1]
  if (!i18n.languages.includes(seg) || seg === i18n.defaultLanguage) return canonicalHref
  return `/${seg}${canonicalHref}`
}
