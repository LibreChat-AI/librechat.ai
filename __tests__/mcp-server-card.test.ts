import { describe, expect, it } from 'vitest'
import { GET } from '@/app/.well-known/mcp/server-card.json/route'

describe('GET /.well-known/mcp/server-card.json', () => {
  it('publishes the MCP server metadata and discovery headers', async () => {
    const response = GET()
    const card = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(response.headers.get('access-control-allow-methods')).toBe('GET')
    expect(response.headers.get('access-control-allow-headers')).toBe('Content-Type')
    expect(response.headers.get('cache-control')).toBe('public, max-age=3600')

    expect(card).toMatchObject({
      $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
      version: '1.0',
      protocolVersion: '2025-06-18',
      serverInfo: {
        name: 'librechat-docs',
        title: 'LibreChat Documentation',
        version: '1.0.0',
      },
      transport: {
        type: 'streamable-http',
        endpoint: '/mcp',
      },
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    })
  })
})
