import { i18n } from './i18n'

export function isExternalHref(href: string): boolean {
  return href.startsWith('http') || href.startsWith('mailto:')
}

/**
 * Prefix an internal `/docs` page link with the active non-default locale (derived
 * from the current pathname's first segment) so a reader on `/<locale>/docs/...`
 * stays in that locale when following related-guide links and cards.
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
  if (href !== '/docs' && !href.startsWith('/docs/')) return href
  if (/\.mdx?($|[?#])/.test(href)) return href
  const seg = pathname.split('/')[1]
  if (!i18n.languages.includes(seg) || seg === i18n.defaultLanguage) return href
  return `/${seg}${href}`
}
