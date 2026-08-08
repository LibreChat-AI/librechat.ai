# OAuth Protected Resource Metadata Worker

This Worker publishes the RFC 9728 metadata document for `https://www.librechat.ai` at:

```text
https://www.librechat.ai/.well-known/oauth-protected-resource
```

The Worker route is limited to the metadata path prefix. Requests that only share the prefix are passed through to the existing Vercel origin.

## Cloudflare Access prerequisite

The Access application for `www.librechat.ai` must have Managed OAuth enabled. The configured authorization server is `https://librechat.cloudflareaccess.com`.

The metadata endpoint must remain publicly readable. If the Access application covers the whole hostname and does not expose this path automatically, add a separate Access application for `www.librechat.ai/.well-known/oauth-protected-resource*` with a narrowly scoped Bypass policy for Everyone.

## Commands

Generate binding types after changing `wrangler.jsonc`:

```bash
pnpm worker:oauth:types
```

Deploy the Worker after authenticating Wrangler to the LibreChat Cloudflare account:

```bash
pnpm worker:oauth:deploy
```

Deployment changes the live Cloudflare route. Review the Access application and route ownership before running it.

After deployment, validate the public response:

```bash
curl -i https://www.librechat.ai/.well-known/oauth-protected-resource
curl -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.librechat.ai"}'
```

The scanner result should report `checks.discovery.oauthProtectedResource.status` as `pass`.
