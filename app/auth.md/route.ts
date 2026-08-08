export const revalidate = false

const body = `# LibreChat auth.md

## Agent audience

This document is for automated agents and tools that read the public LibreChat documentation at https://www.librechat.ai. This service hosts documentation; it is not a LibreChat deployment or an OAuth-protected API.

## Registration and provisioning

- Registration endpoint: none
- Provisioning endpoint: none

Registration is not required for public documentation access. This service does not create agent accounts or issue agent credentials. Do not probe or send requests to \`POST /agent/auth\`.

## Supported method

### Anonymous HTTPS

Use unauthenticated HTTPS \`GET\` requests to read the documentation. Machine-readable entry points include:

- \`https://www.librechat.ai/llms.txt\` for the curated documentation index
- \`https://www.librechat.ai/llms-full.txt\` for the complete documentation export
- Any documentation URL with \`.md\` appended for per-page Markdown

## Credential use

No credentials are issued or required for these public resources. Do not send an \`Authorization\` header, bearer token, API key, or session cookie. Authentication for a self-hosted LibreChat deployment is configured by that deployment's operator and is outside the scope of this documentation service.
`

export async function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  })
}
