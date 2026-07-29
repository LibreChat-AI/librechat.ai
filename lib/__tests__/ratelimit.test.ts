import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  limit: vi.fn(async (_key: string) => ({ success: true, reset: 0 })),
  /** Options every Ratelimit constructed by the module under test received. */
  constructed: [] as Record<string, unknown>[],
  getClientIp: vi.fn((_request: Request): string | null => null),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn((tokens: number, window: string) => ({ tokens, window }))
    limit = h.limit
    constructor(options: Record<string, unknown>) {
      h.constructed.push(options)
    }
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}))

vi.mock('@/lib/rate-limit', () => ({
  getClientIp: (request: Request) => h.getClientIp(request),
}))

/**
 * The module memoizes its limiters and its "degraded mode" warning in module
 * scope, so every test starts from a fresh copy.
 */
async function loadRateLimit() {
  vi.resetModules()
  h.constructed.length = 0
  return import('@/lib/ratelimit')
}

function bucketNamed(prefix: string) {
  return h.constructed.find((options) => options.prefix === prefix)
}

const request = () => new Request('https://example.com/api/chat')

describe('chat rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token'
    h.getClientIp.mockReturnValue(null)
    h.limit.mockResolvedValue({ success: true, reset: 0 })
  })

  describe('with a trusted client IP', () => {
    beforeEach(() => {
      h.getClientIp.mockReturnValue('203.0.113.5')
    })

    it('limits per client, keyed on that IP', async () => {
      const { checkRateLimit } = await loadRateLimit()

      expect(await checkRateLimit(request())).toEqual({ allowed: true })
      expect(h.limit).toHaveBeenCalledWith('203.0.113.5')
    })

    it('uses the per-client bucket at 10 requests per minute', async () => {
      const { checkRateLimit } = await loadRateLimit()
      await checkRateLimit(request())

      expect(bucketNamed('ratelimit:chat')).toBeDefined()
      expect(bucketNamed('ratelimit:chat-global')).toBeUndefined()
      expect(bucketNamed('ratelimit:chat')?.limiter).toEqual({ tokens: 10, window: '60 s' })
    })

    it('blocks and reports the reset when that client is exhausted', async () => {
      h.limit.mockResolvedValue({ success: false, reset: 456 })
      const { checkRateLimit } = await loadRateLimit()

      expect(await checkRateLimit(request())).toEqual({ allowed: false, reset: 456 })
    })

    it('gives each client its own bucket', async () => {
      const { checkRateLimit } = await loadRateLimit()

      h.getClientIp.mockReturnValue('203.0.113.5')
      await checkRateLimit(request())
      h.getClientIp.mockReturnValue('198.51.100.9')
      await checkRateLimit(request())

      expect(h.limit).toHaveBeenNthCalledWith(1, '203.0.113.5')
      expect(h.limit).toHaveBeenNthCalledWith(2, '198.51.100.9')
    })

    it('does not warn about degraded limiting', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { checkRateLimit } = await loadRateLimit()
      await checkRateLimit(request())

      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  describe('without a trusted client IP', () => {
    it('falls back to a single global bucket', async () => {
      const { checkRateLimit } = await loadRateLimit()

      expect(await checkRateLimit(request())).toEqual({ allowed: true })
      expect(h.limit).toHaveBeenCalledWith('global')
    })

    it('gives the global bucket more headroom than a single client', async () => {
      const { checkRateLimit } = await loadRateLimit()
      await checkRateLimit(request())

      expect(bucketNamed('ratelimit:chat')).toBeUndefined()
      expect(bucketNamed('ratelimit:chat-global')?.limiter).toEqual({ tokens: 100, window: '60 s' })
    })

    it('blocks requests when the global bucket is exhausted', async () => {
      h.limit.mockResolvedValue({ success: false, reset: 123 })
      const { checkRateLimit } = await loadRateLimit()

      expect(await checkRateLimit(request())).toEqual({ allowed: false, reset: 123 })
    })

    it('warns once per process, not once per request', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { checkRateLimit } = await loadRateLimit()

      await checkRateLimit(request())
      await checkRateLimit(request())
      await checkRateLimit(request())

      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain('TRUST_CF_CONNECTING_IP')
      warn.mockRestore()
    })
  })

  describe('without Upstash configured', () => {
    beforeEach(() => {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
    })

    it('allows the request instead of failing closed', async () => {
      const { checkRateLimit } = await loadRateLimit()

      expect(await checkRateLimit(request())).toEqual({ allowed: true })
      expect(h.limit).not.toHaveBeenCalled()
    })

    it('does not warn, since limiting is off by choice rather than degraded', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { checkRateLimit } = await loadRateLimit()
      await checkRateLimit(request())

      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })
})
