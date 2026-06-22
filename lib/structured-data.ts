/**
 * JSON-LD (schema.org) structured-data builders.
 *
 * Rendered into pages via the <JsonLd> component to give search engines and
 * social/LLM crawlers an explicit, machine-readable description of the site,
 * the LibreChat software, articles, and breadcrumb trails. We only assert
 * facts the site actually backs (e.g. no SearchAction, since there is no
 * search-results URL), so the graph stays trustworthy.
 */

export const SITE_URL = 'https://www.librechat.ai'
export const SITE_NAME = 'LibreChat'

type JsonLdObject = Record<string, unknown>

/** Resolve a site-relative path to an absolute URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export const organizationSchema: JsonLdObject = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/android-chrome-512x512.png'),
  description: 'The Open-Source AI Platform.',
  sameAs: ['https://github.com/danny-avila/LibreChat', 'https://discord.librechat.ai'],
}

export const websiteSchema: JsonLdObject = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'The Open-Source AI Platform.',
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
}

export const softwareApplicationSchema: JsonLdObject = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web, Linux, macOS, Windows, Docker',
  url: SITE_URL,
  description:
    'LibreChat brings together all your AI conversations in one unified, customizable, open-source interface.',
  license: 'https://github.com/danny-avila/LibreChat/blob/main/LICENSE',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

export function articleSchema(opts: {
  type?: 'Article' | 'BlogPosting' | 'TechArticle'
  headline: string
  description?: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
}): JsonLdObject {
  const schema: JsonLdObject = {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'Article',
    headline: opts.headline,
    url: absoluteUrl(opts.url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(opts.url) },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/android-chrome-512x512.png') },
    },
  }
  if (opts.description) schema.description = opts.description
  if (opts.image) schema.image = absoluteUrl(opts.image)
  if (opts.datePublished) schema.datePublished = opts.datePublished
  if (opts.dateModified ?? opts.datePublished)
    schema.dateModified = opts.dateModified ?? opts.datePublished
  if (opts.authorName) schema.author = { '@type': 'Person', name: opts.authorName }
  return schema
}
