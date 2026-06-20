import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server'
import { createI18nMiddleware } from 'fumadocs-core/i18n'
import { i18n } from '@/lib/i18n'

const i18nMiddleware = createI18nMiddleware(i18n)

function isMarkdownPreferred(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/markdown')
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // Serve raw markdown for content-negotiated requests (LLM/agent tooling).
  if (isMarkdownPreferred(request) && pathname.startsWith('/docs')) {
    const rest = pathname.slice('/docs'.length)
    return NextResponse.rewrite(new URL(`/llms.mdx/docs${rest}`, request.nextUrl))
  }

  // Leave raw markdown routes to next.config rewrites; don't localize them.
  if (pathname.endsWith('.md') || pathname.endsWith('.mdx')) return NextResponse.next()

  // Locale detection + default-locale rewriting for the docs.
  return i18nMiddleware(request, event)
}

export const config = {
  matcher: ['/docs/:path*', '/(zh|es|fr|de|ja)/docs/:path*'],
}
