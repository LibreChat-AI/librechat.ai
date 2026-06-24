import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server'
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware'
import { i18n, LOCALIZED_HOME_LOCALES, LOCALE_COOKIE } from '@/lib/i18n'

const i18nMiddleware = createI18nMiddleware(i18n)

function matchLocale(tag: string, locales: readonly string[]): string | null {
  const normalized = tag.toLowerCase()
  const exact = locales.find((locale) => locale.toLowerCase() === normalized)
  if (exact) return exact

  const base = normalized.split('-')[0]
  const baseLocale = locales.find((locale) => locale.toLowerCase() === base)
  if (baseLocale) return baseLocale

  return locales.find((locale) => locale.toLowerCase().split('-')[0] === base) ?? null
}

function isMarkdownPreferred(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/markdown')
}

/**
 * The reader's preferred site language: an explicit choice (the LOCALE_COOKIE
 * set by the language switcher) wins; otherwise the best `Accept-Language`
 * match among the locales we build; falling back to the default language.
 */
export function preferredLocale(
  request: NextRequest,
  locales: readonly string[] = i18n.languages,
): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie) {
    if (locales.includes(cookie)) return cookie
    // A valid docs-only locale cookie is still an explicit language choice; on
    // `/`, keep those readers on the default home instead of falling through to
    // an unrelated Accept-Language redirect.
    if (i18n.languages.includes(cookie)) return i18n.defaultLanguage
  }

  const header = request.headers.get('accept-language')
  if (!header) return i18n.defaultLanguage

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag, q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const locale = matchLocale(tag, locales)
    if (locale) return locale
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
  // reader whose browser prefers a locale with a translated landing page is
  // forwarded to `/<locale>`; docs-only locales stay on `/` until their UI/home
  // dictionary exists. Deliberately limited to `/`: the content routes (/docs,
  // /blog, …) are shared-CDN-cached, and an Accept-Language redirect there
  // would be cached and served to every reader regardless of their language.
  //
  // The decision depends on Cookie + Accept-Language, so BOTH outcomes must stay
  // out of any shared cache: a cached English `/` 200 (not just the redirect)
  // would otherwise be replayed to a German/Spanish/… visitor without the proxy
  // re-running, bypassing detection. `Vary` alone isn't enough — Cloudflare
  // ignores it — so mark both responses `private, no-store`.
  if (pathname === '/') {
    const locale = preferredLocale(request, LOCALIZED_HOME_LOCALES)
    let response: NextResponse
    if (locale === i18n.defaultLanguage) {
      response = NextResponse.next()
    } else {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      response = NextResponse.redirect(url, 307)
    }
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie, Accept-Language')
    return response
  }

  // Locale detection + default-locale rewriting for the docs.
  return i18nMiddleware(request, event)
}

export const config = {
  matcher: ['/', '/docs/:path*', '/(zh|es|fr|de|ja|pt-BR|it|nl|pl|vi|ko|id|tr)/docs/:path*'],
}
