import { describe, expect, it, vi } from 'vitest'

const docs = [
  {
    url: '/docs/features/mcp',
    path: 'features/mcp.mdx',
    title: 'MCP',
    description: 'Configure Streamable HTTP MCP servers in LibreChat.',
    markdown: '# MCP\n\nConfigure Streamable HTTP MCP servers in LibreChat.',
    searchable: 'mcp configure streamable http mcp servers in librechat.',
  },
  {
    url: '/docs/local/docker',
    path: 'local/docker.mdx',
    title: 'Docker Installation',
    description: 'Install LibreChat with Docker.',
    markdown: '# Docker Installation\n\nInstall LibreChat with Docker.',
    searchable: 'docker installation install librechat with docker.',
  },
]

vi.mock('@/lib/mcp-documents', () => ({
  getMcpDocuments: async () => docs,
  findMcpDocument: async (reference: string) => {
    const path = reference.startsWith('docs://librechat/')
      ? `/docs/${reference.slice('docs://librechat/'.length)}`
      : reference
    return docs.find((document) => document.url === path)
  },
}))

import { GET, POST } from '@/app/mcp/route'

const MCP_URL = 'https://www.librechat.ai/mcp'
const MCP_PROTOCOL_VERSION = '2026-07-28'
const CLIENT_METADATA = {
  'io.modelcontextprotocol/protocolVersion': MCP_PROTOCOL_VERSION,
  'io.modelcontextprotocol/clientInfo': { name: 'route-test', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
}

type JsonRpcMessage = {
  jsonrpc: '2.0'
  id?: string | number
  method: string
  params?: Record<string, unknown>
}

function mirroredName(message: JsonRpcMessage): string | undefined {
  if (!['tools/call', 'resources/read', 'prompts/get'].includes(message.method)) return undefined
  const key = message.method === 'resources/read' ? 'uri' : 'name'
  const value = message.params?.[key]
  return typeof value === 'string' ? value : undefined
}

function requestBody(message: JsonRpcMessage, headers: Record<string, string> = {}): Request {
  const name = mirroredName(message)
  return new Request(MCP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
      'Mcp-Method': message.method,
      ...(name ? { 'Mcp-Name': name } : {}),
      ...headers,
    },
    body: JSON.stringify(message),
  })
}

function modernParams(params: Record<string, unknown> = {}) {
  return { ...params, _meta: CLIENT_METADATA }
}

async function call(method: string, params: Record<string, unknown> = {}, id = 1) {
  const response = await POST(
    requestBody({
      jsonrpc: '2.0',
      id,
      method,
      params: modernParams(params),
    }),
  )

  return { response, body: await response.json() }
}

describe('/mcp Streamable HTTP transport', () => {
  it('discovers the current stateless protocol and advertised capabilities', async () => {
    const { response, body } = await call('server/discover')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('mcp-protocol-version')).toBe(MCP_PROTOCOL_VERSION)
    expect(response.headers.get('mcp-session-id')).toBeNull()
    expect(body).toMatchObject({
      jsonrpc: '2.0',
      id: 1,
      result: {
        resultType: 'complete',
        supportedVersions: expect.arrayContaining([MCP_PROTOCOL_VERSION, '2025-06-18']),
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        _meta: {
          'io.modelcontextprotocol/serverInfo': {
            name: 'librechat-docs',
            version: '1.0.0',
          },
        },
        ttlMs: 3_600_000,
        cacheScope: 'public',
      },
    })
  })

  it('retains the legacy initialize handshake for older clients', async () => {
    const response = await POST(
      new Request(MCP_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'legacy-route-test', version: '1.0.0' },
          },
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('mcp-protocol-version')).toBe('2025-06-18')
    await expect(response.json()).resolves.toMatchObject({
      result: {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {}, resources: {}, prompts: {} },
        serverInfo: { name: 'librechat-docs' },
      },
    })
  })

  it('lists cacheable tools, resources, and prompts without a proposed server card', async () => {
    const tools = await call('tools/list')
    const resources = await call('resources/list')
    const prompts = await call('prompts/list')

    expect(tools.body.result).toMatchObject({
      resultType: 'complete',
      ttlMs: 3_600_000,
      cacheScope: 'public',
      tools: expect.arrayContaining([
        expect.objectContaining({ name: 'search_documentation' }),
        expect.objectContaining({ name: 'get_documentation_page' }),
      ]),
    })
    expect(resources.body.result.resources).toEqual([
      expect.objectContaining({ uri: 'docs://librechat/index' }),
    ])
    expect(prompts.body.result.prompts).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'answer_librechat_question' })]),
    )
  })

  it('searches the documentation through a read-only MCP tool', async () => {
    const { body } = await call('tools/call', {
      name: 'search_documentation',
      arguments: { query: 'Streamable HTTP', limit: 3 },
    })

    expect(body.result.resultType).toBe('complete')
    expect(body.result.isError).toBe(false)
    expect(body.result.structuredContent.results.length).toBeGreaterThan(0)
    expect(body.result.content[0].text).toContain('Streamable HTTP')
  })

  it('reads documentation pages as cacheable MCP resources', async () => {
    const { body } = await call('resources/read', {
      uri: 'docs://librechat/features/mcp',
    })

    expect(body.result).toMatchObject({
      resultType: 'complete',
      ttlMs: 3_600_000,
      cacheScope: 'public',
    })
    expect(body.result.contents).toEqual([
      expect.objectContaining({
        uri: 'docs://librechat/features/mcp',
        mimeType: 'text/markdown',
        text: expect.stringContaining('# MCP'),
      }),
    ])
  })

  it('renders the documentation question prompt', async () => {
    const { body } = await call('prompts/get', {
      name: 'answer_librechat_question',
      arguments: { question: 'How do I configure an MCP server?' },
    })

    expect(body.result.messages).toEqual([
      {
        role: 'user',
        content: {
          type: 'text',
          text: expect.stringContaining('How do I configure an MCP server?'),
        },
      },
    ])
  })

  it('rejects modern requests missing the mirrored method header', async () => {
    const response = await POST(
      requestBody(
        { jsonrpc: '2.0', id: 1, method: 'tools/list', params: modernParams() },
        { 'Mcp-Method': '' },
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: -32020, message: expect.stringContaining('Mcp-Method') },
    })
  })

  it('rejects mirrored names that disagree with the request body', async () => {
    const response = await POST(
      requestBody(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: modernParams({ name: 'search_documentation', arguments: { query: 'MCP' } }),
        },
        { 'Mcp-Name': 'get_documentation_page' },
      ),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: -32020, message: expect.stringContaining('Mcp-Name') },
    })
  })

  it('rejects modern requests missing required per-request metadata', async () => {
    const response = await POST(
      requestBody({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: -32602, message: 'Invalid params' },
    })
  })

  it('returns HTTP 404 for methods missing from the current protocol', async () => {
    const { response, body } = await call('unknown/method')

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32601, message: 'Method not found' },
    })
  })

  it('rejects cross-origin browser requests', async () => {
    const response = await POST(
      requestBody(
        { jsonrpc: '2.0', id: 1, method: 'ping', params: modernParams() },
        { Origin: 'https://attacker.example' },
      ),
    )

    expect(response.status).toBe(403)
  })

  it('does not expose an unsolicited server event stream', async () => {
    const response = GET()

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST, OPTIONS')
  })
})
