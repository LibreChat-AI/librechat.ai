import { describe, expect, it, vi } from 'vitest'
import {
  createWebMCPTools,
  getLocaleFromPathname,
  normalizeNavigablePath,
  registerWebMCPTools,
} from './webmcp'

function getTool(tools: WebMCPToolDefinition[], name: string): WebMCPToolDefinition {
  const tool = tools.find((candidate) => candidate.name === name)
  if (!tool) throw new Error(`Missing tool: ${name}`)
  return tool
}

function createDependencies(overrides: Partial<Parameters<typeof createWebMCPTools>[0]> = {}) {
  return {
    navigate: vi.fn(),
    getCurrentUrl: () => new URL('https://www.librechat.ai/docs'),
    ...overrides,
  }
}

describe('WebMCP tools', () => {
  it('defines discoverable metadata for every tool', () => {
    const tools = createWebMCPTools(createDependencies())

    expect(tools.map((tool) => tool.name)).toEqual([
      'search_librechat_docs',
      'navigate_librechat_site',
      'get_librechat_doc',
    ])

    for (const tool of tools) {
      expect(tool.description).not.toBe('')
      expect(tool.inputSchema).toMatchObject({ type: 'object' })
      expect(tool.execute).toBeTypeOf('function')
    }
  })

  it('searches in the current page language and applies the result limit', async () => {
    const searchDocs = vi.fn(async () => [
      { type: 'page' as const, title: 'Agents', path: '/fr/docs/features/agents', breadcrumbs: [] },
      { type: 'page' as const, title: 'MCP', path: '/fr/docs/features/mcp', breadcrumbs: [] },
    ])
    const tools = createWebMCPTools(
      createDependencies({
        getCurrentUrl: () => new URL('https://www.librechat.ai/fr/docs'),
        searchDocs,
      }),
    )

    const result = await getTool(tools, 'search_librechat_docs').execute({
      query: ' agents ',
      limit: 1,
    })

    expect(searchDocs).toHaveBeenCalledWith('agents', 'fr')
    expect(result).toEqual({
      query: 'agents',
      language: 'fr',
      results: [
        { type: 'page', title: 'Agents', path: '/fr/docs/features/agents', breadcrumbs: [] },
      ],
    })
  })

  it('navigates only to supported same-site paths', async () => {
    const navigate = vi.fn()
    const currentUrl = new URL('https://www.librechat.ai/docs')
    const tools = createWebMCPTools(
      createDependencies({ navigate, getCurrentUrl: () => currentUrl }),
    )
    const tool = getTool(tools, 'navigate_librechat_site')

    await expect(tool.execute({ path: '/blog/release#details' })).resolves.toEqual({
      navigated: true,
      path: '/blog/release#details',
    })
    expect(navigate).toHaveBeenCalledWith('/blog/release#details')
    await expect(tool.execute({ path: '//example.com/docs' })).rejects.toThrow(
      'supported page on this site',
    )
    await expect(tool.execute({ path: '/api/github-stats' })).rejects.toThrow(
      'supported page on this site',
    )
  })

  it('retrieves bounded Markdown through the existing page endpoint', async () => {
    const markdown = 'x'.repeat(1200)
    const fetcher = vi.fn(async (_input: string | URL, _init?: RequestInit) =>
      Promise.resolve(new Response(markdown)),
    )
    const tools = createWebMCPTools(createDependencies({ fetcher }))

    const result = await getTool(tools, 'get_librechat_doc').execute({
      path: '/fr/docs/features/agents#tools',
      maxCharacters: 1000,
    })

    const [requestUrl, requestInit] = fetcher.mock.calls[0]
    expect(requestUrl.toString()).toBe('https://www.librechat.ai/llms.mdx/docs/features/agents')
    expect(requestInit).toEqual({ headers: { Accept: 'text/markdown' } })
    expect(result).toEqual({
      path: '/docs/features/agents',
      markdown: 'x'.repeat(1000),
      truncated: true,
    })
  })

  it('detects locales and normalizes safe navigation paths', () => {
    const currentUrl = new URL('https://www.librechat.ai/')

    expect(getLocaleFromPathname('/pt-BR/docs/features/agents')).toBe('pt-BR')
    expect(getLocaleFromPathname('/blog')).toBe('en')
    expect(normalizeNavigablePath('/docs/../about?from=docs', currentUrl)).toBe('/about?from=docs')
    expect(() => normalizeNavigablePath('/docs/../../api/chat', currentUrl)).toThrow(
      'supported page on this site',
    )
  })
})

describe('WebMCP registration', () => {
  const tools = createWebMCPTools(createDependencies())

  it('prefers document.modelContext and passes the lifecycle signal to each tool', () => {
    const abortedTools: string[] = []
    const navigatorRegister = vi.fn(
      async (tool: WebMCPToolDefinition, options?: { signal?: AbortSignal }) => {
        options?.signal?.addEventListener('abort', () => abortedTools.push(tool.name), {
          once: true,
        })
      },
    )
    const documentRegister = vi.fn(
      async (tool: WebMCPToolDefinition, options?: { signal?: AbortSignal }) => {
        options?.signal?.addEventListener('abort', () => abortedTools.push(tool.name), {
          once: true,
        })
      },
    )
    const controller = new AbortController()

    const registered = registerWebMCPTools(tools, controller.signal, {
      navigatorModelContext: { registerTool: navigatorRegister },
      documentModelContext: { registerTool: documentRegister },
    })

    expect(registered).toBe(true)
    expect(documentRegister).toHaveBeenCalledTimes(tools.length)
    expect(navigatorRegister).not.toHaveBeenCalled()
    for (const call of documentRegister.mock.calls) {
      expect(call[1]?.signal).toBe(controller.signal)
    }

    controller.abort()
    expect(controller.signal.aborted).toBe(true)
    expect(abortedTools).toEqual(tools.map(({ name }) => name))
  })

  it('falls back to navigator.modelContext for older Chrome implementations', () => {
    const navigatorRegister = vi.fn(
      async (_tool: WebMCPToolDefinition, _options?: { signal?: AbortSignal }) => {},
    )

    expect(
      registerWebMCPTools(tools, new AbortController().signal, {
        navigatorModelContext: { registerTool: navigatorRegister },
      }),
    ).toBe(true)
    expect(navigatorRegister).toHaveBeenCalledTimes(tools.length)
  })

  it('supports Chrome implementations whose registerTool returns void', () => {
    const navigatorRegister = vi.fn(
      (_tool: WebMCPToolDefinition, _options?: { signal?: AbortSignal }) => {},
    )

    expect(() =>
      registerWebMCPTools(tools, new AbortController().signal, {
        navigatorModelContext: { registerTool: navigatorRegister },
      }),
    ).not.toThrow()
    expect(navigatorRegister).toHaveBeenCalledTimes(tools.length)
  })

  it('contains synchronous and asynchronous registration failures', async () => {
    const syncError = new Error('sync failure')
    const asyncError = new Error('async failure')
    const registerTool = vi.fn((tool: WebMCPToolDefinition) => {
      if (tool === tools[0]) throw syncError
      if (tool === tools[1]) return Promise.reject(asyncError)
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      expect(() =>
        registerWebMCPTools(tools, new AbortController().signal, {
          documentModelContext: { registerTool },
        }),
      ).not.toThrow()
      await Promise.resolve()

      expect(registerTool).toHaveBeenCalledTimes(tools.length)
      expect(consoleError).toHaveBeenCalledWith(
        `[WebMCP] Failed to register ${tools[0].name}:`,
        syncError,
      )
      expect(consoleError).toHaveBeenCalledWith(
        `[WebMCP] Failed to register ${tools[1].name}:`,
        asyncError,
      )
    } finally {
      consoleError.mockRestore()
    }
  })
})
