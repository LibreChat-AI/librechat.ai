/// <reference types="@cloudflare/workers-types" />

const METADATA_PATH = '/.well-known/oauth-protected-resource'

const RESPONSE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  'X-Content-Type-Options': 'nosniff',
} as const

function metadataResponse(env: Env, includeBody: boolean): Response {
  const metadata = {
    resource: env.RESOURCE_IDENTIFIER,
    authorization_servers: [env.AUTHORIZATION_SERVER],
    bearer_methods_supported: ['header'],
  }

  if (includeBody) {
    return Response.json(metadata, { headers: RESPONSE_HEADERS })
  }

  return new Response(null, {
    headers: {
      ...RESPONSE_HEADERS,
      'Content-Type': 'application/json',
    },
  })
}

export function handleRequest(request: Request, env: Env): Response | Promise<Response> {
  const url = new URL(request.url)

  if (url.pathname !== METADATA_PATH && url.pathname !== `${METADATA_PATH}/`) {
    return fetch(request)
  }

  if (request.method === 'GET') {
    return metadataResponse(env, true)
  }

  if (request.method === 'HEAD') {
    return metadataResponse(env, false)
  }

  return Response.json(
    { error: 'method_not_allowed' },
    {
      status: 405,
      headers: {
        ...RESPONSE_HEADERS,
        Allow: 'GET, HEAD',
      },
    },
  )
}

export default {
  fetch: handleRequest,
} satisfies ExportedHandler<Env>
