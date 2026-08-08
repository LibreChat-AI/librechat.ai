import { describe, expect, it, vi } from 'vitest'
import { handleRequest } from '../src/index'

const env = {
  RESOURCE_IDENTIFIER: 'https://www.librechat.ai',
  AUTHORIZATION_SERVER: 'https://librechat.cloudflareaccess.com',
} satisfies Env

describe('OAuth protected resource metadata Worker', () => {
  it('publishes RFC 9728 metadata for GET requests', async () => {
    const response = await handleRequest(
      new Request('https://www.librechat.ai/.well-known/oauth-protected-resource'),
      env,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(await response.json()).toEqual({
      resource: 'https://www.librechat.ai',
      authorization_servers: ['https://librechat.cloudflareaccess.com'],
      bearer_methods_supported: ['header'],
    })
  })

  it('supports metadata discovery through HEAD', async () => {
    const response = await handleRequest(
      new Request('https://www.librechat.ai/.well-known/oauth-protected-resource', {
        method: 'HEAD',
      }),
      env,
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.text()).toBe('')
  })

  it('rejects unsupported methods', async () => {
    const response = await handleRequest(
      new Request('https://www.librechat.ai/.well-known/oauth-protected-resource', {
        method: 'POST',
      }),
      env,
    )

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('GET, HEAD')
  })

  it('passes unrelated prefix matches through to the origin', async () => {
    const originResponse = new Response('origin')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(originResponse)
    const request = new Request(
      'https://www.librechat.ai/.well-known/oauth-protected-resource-extra',
    )

    const response = await handleRequest(request, env)

    expect(fetchMock).toHaveBeenCalledWith(request)
    expect(response).toBe(originResponse)
    fetchMock.mockRestore()
  })
})
