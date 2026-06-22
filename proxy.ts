import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server'
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware'
import { i18n, LOCALE_COOKIE } from '@/lib/i18n'

const i18nMiddleware = createI18nMiddleware(i18n)

function isMarkdownPreferred(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/markdown')
}

/**
 * The reader's preferred site language: an explicit choice (the LOCALE_COOKIE
 * set by the language switcher) wins; otherwise the best `Accept-Language`
 * match among the locales we build; falling back to the default language.
 */
function preferredLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && i18n.languages.includes(cookie)) return cookie

  const header = request.headers.get('accept-language')
  if (!header) return i18n.defaultLanguage

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { base: tag.split('-')[0].toLowerCase(), q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { base } of ranked) {
    if (i18n.languages.includes(base)) return base
  }
  return i18n.defaultLanguage
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // Leave raw markdown routes to next.config rewrites; don't localize them.
  // Must run before content negotiation: an Accept: text/markdown request to a
  // .md/.mdx URL needs to keep its suffix so the next.config rewrite can strip
  // it, otherwise the route handler gets a slug that still ends in .md and 404s.
  if (pathname.endsWith('.md') || pathname.endsWith('.mdx')) return NextResponse.next()

  // Serve raw markdown for content-negotiated requests (LLM/agent tooling).
  if (isMarkdownPreferred(request) && pathname.startsWith('/docs')) {
    const rest = pathname.slice('/docs'.length)
    return NextResponse.rewrite(new URL(`/llms.mdx/docs${rest}`, request.nextUrl))
  }

  // Browser-language auto-detection, scoped to the prefix-less home page. A
  // reader whose browser prefers a translated locale is forwarded to its
  // landing page (`/<locale>`); English readers and explicit English choosers
  // stay on `/`. Deliberately limited to `/`: the content routes (/docs, /blog,
  // …) are shared-CDN-cached, and an Accept-Language redirect there would be
  // cached and served to every reader regardless of their language. `no-store`
  // + `Vary` keep this redirect itself out of any shared cache.
  if (pathname === '/') {
    const locale = preferredLocale(request)
    if (locale === i18n.defaultLanguage) return NextResponse.next()
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    const response = NextResponse.redirect(url, 307)
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie, Accept-Language')
    return response
  }

  // Locale detection + default-locale rewriting for the docs.
  return i18nMiddleware(request, event)
}

export const config = {
  matcher: ['/', '/docs/:path*', '/(zh|es|fr|de|ja)/docs/:path*'],
}
