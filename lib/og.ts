/**
 * Builds the URL for an on-demand Open Graph image (see app/api/og/route.tsx).
 * Used in generateMetadata so every page gets a social card rendered with its
 * own title instead of one shared static image. Relative URLs resolve against
 * `metadataBase` in the root layout.
 *
 * Every URL carries a `v=` content fingerprint (lib/og-version.mjs, inlined via
 * next.config `env.OG_VERSION`). When the card art changes the fingerprint
 * changes, so the URL is brand-new and no CDN edge or social-scraper image
 * proxy serves a stale card. Without it, a redesigned card keeps the same URL
 * and every cache layer keeps the old bytes forever.
 */
export type OgType = 'docs' | 'blog' | 'changelog'

export function ogImageUrl(opts: { title?: string; type?: OgType } = {}): string {
  const params = new URLSearchParams()
  if (opts.title) params.set('title', opts.title)
  if (opts.type) params.set('type', opts.type)
  if (process.env.OG_VERSION) params.set('v', process.env.OG_VERSION)
  const qs = params.toString()
  return `/api/og${qs ? `?${qs}` : ''}`
}
