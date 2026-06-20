import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockIsRateLimited = vi.fn(() => false)

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => mockIsRateLimited,
}))

const { submitFeedback } = await import('../feedback')

describe('submitFeedback', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsRateLimited.mockReturnValue(false)
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    delete process.env.GITHUB_FEEDBACK_TOKEN
    delete process.env.GITHUB_DISCUSSION_CATEGORY_ID
    delete process.env.GITHUB_DISCUSSION_REPO_ID
    delete process.env.DISCORD_FEEDBACK_WEBHOOK
  })

  it('rejects invalid payloads before rate limiting', async () => {
    const result = await submitFeedback({
      opinion: 'great',
      message: 'nice',
      url: '/docs/test',
    } as never)

    expect(result).toEqual({ success: false })
    expect(mockIsRateLimited).not.toHaveBeenCalled()
  })

  it('rejects external URLs to prevent open redirects', async () => {
    const result = await submitFeedback({
      opinion: 'good',
      message: 'helpful',
      url: 'https://evil.example/docs',
    })

    expect(result).toEqual({ success: false })
    expect(mockIsRateLimited).not.toHaveBeenCalled()
  })

  it('rejects protocol-relative URLs', async () => {
    const result = await submitFeedback({
      opinion: 'bad',
      message: 'confusing',
      url: '//evil.example/docs',
    })

    expect(result).toEqual({ success: false })
  })

  it('returns false when rate limited by page URL', async () => {
    mockIsRateLimited.mockReturnValue(true)

    const result = await submitFeedback({
      opinion: 'good',
      message: 'clear docs',
      url: '/docs/quick-start',
    })

    expect(result).toEqual({ success: false })
    expect(mockIsRateLimited).toHaveBeenCalledWith('/docs/quick-start')
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('accepts valid feedback and posts to configured integrations', async () => {
    process.env.GITHUB_FEEDBACK_TOKEN = 'gh-token'
    process.env.GITHUB_DISCUSSION_CATEGORY_ID = 'category-id'
    process.env.GITHUB_DISCUSSION_REPO_ID = 'repo-id'
    process.env.DISCORD_FEEDBACK_WEBHOOK = 'https://discord.test/webhook'

    const result = await submitFeedback({
      opinion: 'bad',
      message: '  Needs more examples  ',
      url: '/docs/configuration',
    })

    expect(result).toEqual({ success: true })
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('truncates overly long messages', async () => {
    process.env.GITHUB_FEEDBACK_TOKEN = 'gh-token'
    process.env.GITHUB_DISCUSSION_CATEGORY_ID = 'category-id'
    process.env.GITHUB_DISCUSSION_REPO_ID = 'repo-id'

    const longMessage = 'a'.repeat(2500)

    const result = await submitFeedback({
      opinion: 'good',
      message: longMessage,
      url: '/docs/limits',
    })

    expect(result).toEqual({ success: true })

    const githubCall = vi
      .mocked(globalThis.fetch)
      .mock.calls.find(([url]) => url === 'https://api.github.com/graphql')
    expect(githubCall).toBeDefined()

    const payload = JSON.parse(String(githubCall?.[1]?.body))
    expect(payload.variables.body.length).toBeLessThan(longMessage.length)
    expect(payload.variables.body).not.toContain('a'.repeat(2500))
  })

  it('treats non-string messages as empty', async () => {
    const result = await submitFeedback({
      opinion: 'good',
      message: 123 as never,
      url: '/docs/no-message',
    })

    expect(result).toEqual({ success: true })
  })
})
