import { expect, test, type APIRequestContext } from '@playwright/test'

const MCP_PROTOCOL_VERSION = '2026-07-28'
const baseHeaders = {
  Accept: 'application/json, text/event-stream',
  'Content-Type': 'application/json',
  'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
}

function nameFor(method: string, params: Record<string, unknown>): string | undefined {
  if (method === 'resources/read') {
    return typeof params.uri === 'string' ? params.uri : undefined
  }
  if (method === 'tools/call' || method === 'prompts/get') {
    return typeof params.name === 'string' ? params.name : undefined
  }
  return undefined
}

async function callMcp(
  request: APIRequestContext,
  method: string,
  params: Record<string, unknown> = {},
  id = 1,
) {
  const name = nameFor(method, params)
  const response = await request.post('/mcp', {
    headers: {
      ...baseHeaders,
      'Mcp-Method': method,
      ...(name ? { 'Mcp-Name': name } : {}),
    },
    data: {
      jsonrpc: '2.0',
      id,
      method,
      params: {
        ...params,
        _meta: {
          'io.modelcontextprotocol/protocolVersion': MCP_PROTOCOL_VERSION,
          'io.modelcontextprotocol/clientInfo': { name: 'playwright', version: '1.0.0' },
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    },
    timeout: 60_000,
  })
  expect(response.status()).toBe(200)
  return response.json()
}

test('serves the LibreChat documentation MCP protocol', async ({ request }) => {
  const discovery = await callMcp(request, 'server/discover', {}, 1)
  expect(discovery.result).toMatchObject({
    resultType: 'complete',
    supportedVersions: expect.arrayContaining([MCP_PROTOCOL_VERSION]),
    capabilities: { tools: {}, resources: {}, prompts: {} },
    _meta: {
      'io.modelcontextprotocol/serverInfo': { name: 'librechat-docs' },
    },
  })

  const tools = await callMcp(request, 'tools/list', {}, 2)
  expect(tools.result).toMatchObject({
    resultType: 'complete',
    ttlMs: 3_600_000,
    cacheScope: 'public',
  })
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
