import { expect, test } from '@playwright/test'

test('serves the MCP server card for agent discovery', async ({ request }) => {
  const response = await request.get('/.well-known/mcp/server-card.json')

  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/json')
  expect(response.headers()['access-control-allow-origin']).toBe('*')
  expect(response.headers()['access-control-allow-methods']).toBe('GET')
  expect(response.headers()['access-control-allow-headers']).toBe('Content-Type')

  await expect(response.json()).resolves.toMatchObject({
    serverInfo: {
      name: expect.any(String),
      version: expect.any(String),
    },
    transport: {
      type: 'streamable-http',
      endpoint: '/mcp',
    },
    capabilities: {
      tools: expect.any(Object),
      resources: expect.any(Object),
      prompts: expect.any(Object),
    },
  })
})
