import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockLimit = vi.fn(async (_key: string) => ({ success: true, reset: 0 }))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn(() => 'sliding-window')
    limit = mockLimit
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({}),
  },
}))

const mockGetClientIp = vi.fn((_request: Request): string | null => null)

vi.mock('@/lib/rate-limit', () => ({
  getClientIp: (request: Request) => mockGetClientIp(request),
}))

const { checkRateLimit } = await import('@/lib/ratelimit')

describe('chat rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token'
    mockGetClientIp.mockReturnValue(null)
    mockLimit.mockResolvedValue({ success: true, reset: 0 })
  })

  it('uses a global bucket when no trusted client IP is available', async () => {
    expect(await checkRateLimit(new Request('https://example.com/api/chat'))).toEqual({
      allowed: true,
    })
    expect(mockLimit).toHaveBeenCalledWith('global')
  })

  it('blocks requests when the global bucket is exhausted', async () => {
    mockLimit.mockResolvedValue({ success: false, reset: 123 })

    expect(await checkRateLimit(new Request('https://example.com/api/chat'))).toEqual({
      allowed: false,
      reset: 123,
    })
  })
})
