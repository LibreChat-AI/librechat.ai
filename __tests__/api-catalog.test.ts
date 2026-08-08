import { describe, expect, it } from 'vitest'
import { GET, HEAD } from '@/app/.well-known/api-catalog/route'

const catalogUrl = 'https://www.librechat.ai/.well-known/api-catalog'

describe('/.well-known/api-catalog', () => {
  it('returns the LibreChat API catalog as an RFC 9727 JSON Linkset', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    )
    expect(response.headers.get('link')).toBe(
      `<${catalogUrl}>; rel="api-catalog"; type="application/linkset+json"`,
    )
    await expect(response.json()).resolves.toEqual({
      linkset: [
        {
          anchor: 'https://www.librechat.ai/api/chat',
          'service-desc': [
            {
              href: 'https://www.librechat.ai/openapi.json',
              type: 'application/vnd.oai.openapi+json;version=3.1',
            },
          ],
          'service-doc': [
            {
              href: 'https://www.librechat.ai/docs',
              type: 'text/html',
            },
          ],
        },
      ],
    })
  })

  it('returns discovery headers and no body for HEAD', async () => {
    const response = await HEAD()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    )
    expect(response.headers.get('link')).toBe(
      `<${catalogUrl}>; rel="api-catalog"; type="application/linkset+json"`,
    )
    await expect(response.text()).resolves.toBe('')
  })
})
