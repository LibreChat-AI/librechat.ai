import { expect, test, type APIRequestContext } from '@playwright/test'

const headers = {
  Accept: 'application/json, text/event-stream',
  'Content-Type': 'application/json',
  'MCP-Protocol-Version': '2025-06-18',
}

async function callMcp(
  request: APIRequestContext,
  method: string,
  params: Record<string, unknown> = {},
  id = 1,
) {
  const response = await request.post('/mcp', {
    headers,
    data: { jsonrpc: '2.0', id, method, params },
    timeout: 60_000,
  })
  expect(response.status()).toBe(200)
  return response.json()
}

test('serves the LibreChat documentation MCP protocol', async ({ request }) => {
  const initialize = await callMcp(
    request,
    'initialize',
    {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'playwright', version: '1.0.0' },
    },
    1,
  )
  expect(initialize.result).toMatchObject({
    protocolVersion: '2025-06-18',
    capabilities: { tools: {}, resources: {}, prompts: {} },
    serverInfo: { name: 'librechat-docs' },
  })

  const tools = await callMcp(request, 'tools/list', {}, 2)
  expect(tools.result.tools).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'search_documentation' })]),
  )

  const search = await callMcp(
    request,
    'tools/call',
    {
      name: 'search_documentation',
      arguments: { query: 'Streamable HTTP', limit: 3 },
    },
    3,
  )
  expect(search.result.isError).toBe(false)
  expect(search.result.structuredContent.results.length).toBeGreaterThan(0)

  const resource = await callMcp(
    request,
    'resources/read',
    { uri: 'docs://librechat/features/mcp' },
    4,
  )
  expect(resource.result.contents[0]).toMatchObject({
    uri: 'docs://librechat/features/mcp',
    mimeType: 'text/markdown',
  })
  expect(resource.result.contents[0].text).toContain('# MCP')

  const prompt = await callMcp(
    request,
    'prompts/get',
    {
      name: 'answer_librechat_question',
      arguments: { question: 'How do I configure an MCP server?' },
    },
    5,
  )
  expect(prompt.result.messages[0].content.text).toContain('How do I configure an MCP server?')
})
