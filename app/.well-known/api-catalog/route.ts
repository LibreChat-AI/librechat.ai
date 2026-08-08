const SITE_URL = 'https://www.librechat.ai'
const CATALOG_URL = `${SITE_URL}/.well-known/api-catalog`
const CATALOG_MEDIA_TYPE =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"'

const headers = {
  'Content-Type': CATALOG_MEDIA_TYPE,
  Link: `<${CATALOG_URL}>; rel="api-catalog"; type="application/linkset+json"`,
}

const catalog = {
  linkset: [
    {
      anchor: `${SITE_URL}/api/chat`,
      'service-desc': [
        {
          href: `${SITE_URL}/openapi.json`,
          type: 'application/vnd.oai.openapi+json;version=3.1',
        },
      ],
      'service-doc': [
        {
          href: `${SITE_URL}/docs`,
          type: 'text/html',
        },
      ],
    },
  ],
}

export const revalidate = false

export function GET() {
  return new Response(JSON.stringify(catalog), {
    status: 200,
    headers,
  })
}

export function HEAD() {
  return new Response(null, {
    status: 200,
    headers,
  })
}
