import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { jsonRequest } from '@/__tests__/helpers'

const mockCheckRateLimit = vi.fn()
const mockStreamText = vi.fn()
const mockConvertToModelMessages = vi.fn()
const mockToUIMessageStreamResponse = vi.fn()

vi.mock('@/lib/ratelimit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}))

vi.mock('ai', () => ({
  streamText: (...args: unknown[]) => mockStreamText(...args),
  tool: (definition: unknown) => definition,
  stepCountIs: (count: number) => count,
  convertToModelMessages: (...args: unknown[]) => mockConvertToModelMessages(...args),
}))

vi.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: () => ({
    chat: () => 'mock-model',
  }),
}))

vi.mock('@/lib/source', () => ({
  docsSource: {
    getPages: () => [],
  },
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

const { POST } = await import('../route')

function chatRequest(messages: unknown[], headers: Record<string, string> = {}): Request {
  return jsonRequest('https://example.com/api/chat', { messages }, { headers })
}

describe('POST /api/chat', () => {
  const originalApiKey = process.env.OPENROUTER_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENROUTER_API_KEY = 'test-key'
    mockCheckRateLimit.mockResolvedValue({ allowed: true })
    mockConvertToModelMessages.mockResolvedValue([{ role: 'user', content: 'hello' }])
    mockToUIMessageStreamResponse.mockReturnValue(
      new Response('0:"Hello from the docs assistant"\n', {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      }),
    )
    mockStreamText.mockReturnValue({
      toUIMessageStreamResponse: mockToUIMessageStreamResponse,
    })
  })

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = originalApiKey
  })

  it('returns 429 when rate limited', async () => {
    const reset = Date.now() + 30_000
    mockCheckRateLimit.mockResolvedValue({ allowed: false, reset })

    const response = await POST(chatRequest([{ role: 'user', content: 'hello' }]))
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body).toEqual({ error: 'Too many requests. Please try again shortly.' })
    expect(response.headers.get('Retry-After')).toBe(String(Math.ceil((reset - Date.now()) / 1000)))
    expect(mockStreamText).not.toHaveBeenCalled()
  })

  it('returns 503 when OPENROUTER_API_KEY is not configured', async () => {
    delete process.env.OPENROUTER_API_KEY

    const response = await POST(chatRequest([{ role: 'user', content: 'hello' }]))
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({ error: 'OPENROUTER_API_KEY is not configured' })
    expect(mockStreamText).not.toHaveBeenCalled()
  })

  it('returns a UI message stream response in search mode', async () => {
    const response = await POST(chatRequest([{ role: 'user', content: 'How do I deploy?' }]))

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('Hello from the docs assistant')
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          search: expect.any(Object),
          navigate: expect.any(Object),
        }),
        toolChoice: 'auto',
      }),
    )
    expect(mockToUIMessageStreamResponse).toHaveBeenCalledOnce()
  })

  it('uses page mode without tools when a valid docs page header is provided', async () => {
    const response = await POST(
      chatRequest([{ role: 'user', content: 'Summarize this page' }], {
        'x-chat-mode': 'page',
        'x-chat-page': '/docs/quick-start/install',
      }),
    )

    expect(response.status).toBe(200)
    expect(mockStreamText).toHaveBeenCalledWith(
      expect.not.objectContaining({
        tools: expect.anything(),
      }),
    )
    expect(mockToUIMessageStreamResponse).toHaveBeenCalledOnce()
  })

  it('rejects traversal in x-chat-page and falls back to search mode', async () => {
    await POST(
      chatRequest([{ role: 'user', content: 'Show me docs' }], {
        'x-chat-mode': 'page',
        'x-chat-page': '/docs/../secrets',
      }),
    )

    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          search: expect.any(Object),
          navigate: expect.any(Object),
        }),
      }),
    )
  })

  it('rejects external URLs in x-chat-page and falls back to search mode', async () => {
    await POST(
      chatRequest([{ role: 'user', content: 'Show me docs' }], {
        'x-chat-mode': 'page',
        'x-chat-page': 'https://evil.example/docs',
      }),
    )

    expect(mockStreamText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          search: expect.any(Object),
        }),
      }),
    )
  })
})
