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

function requestBody(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(MCP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      'MCP-Protocol-Version': '2025-06-18',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

async function call(method: string, params: unknown = {}, id = 1) {
  const response = await POST(
    requestBody({
      jsonrpc: '2.0',
      id,
      method,
      params,
    }),
  )

  return { response, body: await response.json() }
}

describe('/mcp Streamable HTTP transport', () => {
  it('negotiates the MCP lifecycle and declares the advertised capabilities', async () => {
    const response = await POST(
      requestBody(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-06-18',
            capabilities: {},
            clientInfo: { name: 'route-test', version: '1.0.0' },
          },
        },
        { 'MCP-Protocol-Version': '' },
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(response.headers.get('mcp-protocol-version')).toBe('2025-06-18')
    expect(response.headers.get('mcp-session-id')).toBeNull()
    await expect(response.json()).resolves.toMatchObject({
      jsonrpc: '2.0',
      id: 1,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        serverInfo: {
          name: 'librechat-docs',
          version: '1.0.0',
        },
      },
    })
  })

  it('accepts initialized notifications without a response body', async () => {
    const response = await POST(
      requestBody({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    )

    expect(response.status).toBe(202)
    await expect(response.text()).resolves.toBe('')
  })

  it('lists tools, resources, and prompts', async () => {
    const tools = await call('tools/list')
    const resources = await call('resources/list')
    const prompts = await call('prompts/list')

    expect(tools.body.result.tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'search_documentation' }),
        expect.objectContaining({ name: 'get_documentation_page' }),
      ]),
    )
    expect(resources.body.result.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ uri: 'docs://librechat/index' }),
        expect.objectContaining({ uri: 'mcp://server-card.json' }),
      ]),
    )
    expect(prompts.body.result.prompts).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'answer_librechat_question' })]),
    )
  })

  it('searches the documentation through a read-only MCP tool', async () => {
    const { body } = await call('tools/call', {
      name: 'search_documentation',
      arguments: { query: 'Streamable HTTP', limit: 3 },
    })

    expect(body.result.isError).toBe(false)
    expect(body.result.structuredContent.results.length).toBeGreaterThan(0)
    expect(body.result.content[0].text).toContain('Streamable HTTP')
  })

  it('reads documentation pages as MCP resources', async () => {
    const { body } = await call('resources/read', {
      uri: 'docs://librechat/features/mcp',
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

  it('returns protocol errors for unknown methods', async () => {
    const { response, body } = await call('unknown/method')

    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32601, message: 'Method not found' },
    })
  })

  it('rejects cross-origin browser requests', async () => {
    const response = await POST(
      requestBody(
        { jsonrpc: '2.0', id: 1, method: 'ping', params: {} },
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
