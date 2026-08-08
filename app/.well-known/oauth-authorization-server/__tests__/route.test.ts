import { describe, expect, it } from 'vitest'
import { GET } from '../route'

describe('GET /.well-known/oauth-authorization-server', () => {
  it('publishes the Cloudflare Access authorization server metadata', async () => {
    const response = GET()
    const metadata = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(metadata).toEqual({
      issuer: 'https://librechat.cloudflareaccess.com',
      authorization_endpoint:
        'https://librechat.cloudflareaccess.com/cdn-cgi/access/oauth/authorization',
      token_endpoint: 'https://librechat.cloudflareaccess.com/cdn-cgi/access/oauth/token',
      jwks_uri: 'https://librechat.cloudflareaccess.com/cdn-cgi/access/certs',
      response_types_supported: ['code'],
      response_modes_supported: ['query'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
      revocation_endpoint: 'https://librechat.cloudflareaccess.com/cdn-cgi/access/oauth/revoke',
      registration_endpoint:
        'https://librechat.cloudflareaccess.com/cdn-cgi/access/oauth/registration',
      code_challenge_methods_supported: ['S256'],
    })
    expect(metadata).not.toHaveProperty('agent_auth')
  })
})
