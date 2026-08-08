import { createWebBotAuthDirectoryHeaders, getWebBotAuthPublicJwk } from '@/lib/web-bot-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const publicJwk = getWebBotAuthPublicJwk()
    const signatureHeaders = createWebBotAuthDirectoryHeaders(new URL(request.url).host)

    if (!publicJwk || !signatureHeaders) {
      return Response.json(
        { error: 'Web Bot Auth signing key is not configured' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return new Response(JSON.stringify({ keys: [publicJwk] }), {
      headers: {
        'Content-Type': 'application/http-message-signatures-directory+json',
        'Cache-Control': 'public, max-age=60',
        ...signatureHeaders,
      },
    })
  } catch {
    return Response.json(
      { error: 'Web Bot Auth signing key is invalid' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
