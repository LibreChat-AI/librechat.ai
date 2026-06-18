/**
 * Builds the URL for an on-demand Open Graph image (see app/api/og/route.tsx).
 * Used in generateMetadata so every page gets a social card rendered with its
 * own title instead of one shared static image. Relative URLs resolve against
 * `metadataBase` in the root layout.
 */
export type OgType = 'docs' | 'blog' | 'changelog'

export function ogImageUrl(opts: { title?: string; type?: OgType } = {}): string {
  const params = new URLSearchParams()
  if (opts.title) params.set('title', opts.title)
  if (opts.type) params.set('type', opts.type)
  const qs = params.toString()
  return `/api/og${qs ? `?${qs}` : ''}`
}
