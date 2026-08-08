const ACCESS_ISSUER = 'https://librechat.cloudflareaccess.com'

const metadata = {
  issuer: ACCESS_ISSUER,
  authorization_endpoint: `${ACCESS_ISSUER}/cdn-cgi/access/oauth/authorization`,
  token_endpoint: `${ACCESS_ISSUER}/cdn-cgi/access/oauth/token`,
  jwks_uri: `${ACCESS_ISSUER}/cdn-cgi/access/certs`,
  response_types_supported: ['code'],
  response_modes_supported: ['query'],
  grant_types_supported: ['authorization_code', 'refresh_token'],
  token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
  revocation_endpoint: `${ACCESS_ISSUER}/cdn-cgi/access/oauth/revoke`,
  registration_endpoint: `${ACCESS_ISSUER}/cdn-cgi/access/oauth/registration`,
  code_challenge_methods_supported: ['S256'],
}

export function GET() {
  return Response.json(metadata, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
