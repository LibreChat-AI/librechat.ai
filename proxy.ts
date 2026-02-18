import { NextRequest, NextResponse } from 'next/server'

function isMarkdownPreferred(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? ''
  return accept.includes('text/markdown')
}

export default function proxy(request: NextRequest) {
  if (isMarkdownPreferred(request)) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/docs')) {
      const rest = pathname.slice('/docs'.length)
      const rewritten = `/llms.mdx/docs${rest}`
      return NextResponse.rewrite(new URL(rewritten, request.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/docs/:path*'],
}
