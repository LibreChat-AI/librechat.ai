import { describe, expect, it } from 'vitest'
import { GET } from '../route'

describe('GET /openapi.json', () => {
  it('describes the public documentation assistant API with OpenAPI 3.1', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'application/vnd.oai.openapi+json;version=3.1',
    )

    await expect(response.json()).resolves.toMatchObject({
      openapi: '3.1.0',
      servers: [{ url: 'https://www.librechat.ai' }],
      paths: {
        '/api/chat': {
          post: expect.any(Object),
        },
      },
    })
  })
})
