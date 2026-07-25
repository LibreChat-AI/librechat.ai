import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  claimSubscribeRequest,
  claimUnsubscribeRequestCooldown,
  isNewsletterEmailConfigured,
  isSubscribeRequestConfigured,
  isSubscribeRequestRateLimited,
  isUnsubscribeRequestConfigured,
  isUnsubscribeRequestRateLimited,
  isUnsubscribeTokenRateLimited,
  releaseUnsubscribeRequestCooldown,
  releaseSubscribeRequest,
  renewSubscribeRequest,
  sendUnsubscribeLinkEmail,
} from '@/lib/newsletter-email'

const mockRedisSet = vi.fn(async () => 'OK')
const mockRedisDel = vi.fn(async () => 1)
const mockRedisEval = vi.fn(async () => 1)
const mockRedisGet = vi.fn(async () => 1)
const mockRateLimit = vi.fn(async () => ({ success: true }))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn(() => 'sliding-window')
    limit = mockRateLimit
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      set: mockRedisSet,
      del: mockRedisDel,
      get: mockRedisGet,
      eval: mockRedisEval,
    }),
  },
}))

describe('newsletter unsubscribe email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.LOOPS_API_KEY = 'loops-key'
    process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID = 'transactional-id'
    process.env.UNSUBSCRIBE_SECRET = 'unsubscribe-secret'
    process.env.NEWSLETTER_PUBLIC_URL = 'https://www.librechat.ai'
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.LOOPS_API_KEY
    delete process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID
    delete process.env.UNSUBSCRIBE_SECRET
    delete process.env.NEWSLETTER_PUBLIC_URL
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  it('requires all email and signing configuration', () => {
    expect(isNewsletterEmailConfigured()).toBe(true)
    delete process.env.UNSUBSCRIBE_SECRET
    expect(isNewsletterEmailConfigured()).toBe(false)
  })

  it('requires shared Redis for unsubscribe-link requests', () => {
    expect(isUnsubscribeRequestConfigured()).toBe(true)
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    expect(isUnsubscribeRequestConfigured()).toBe(false)
  })

  it('requires shared Redis for subscription requests', () => {
    expect(isSubscribeRequestConfigured()).toBe(true)
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    expect(isSubscribeRequestConfigured()).toBe(false)
  })

  it('claims a hashed shared cooldown key', async () => {
    expect(await claimUnsubscribeRequestCooldown('user@example.com')).toBe(true)
    expect(mockRedisSet).toHaveBeenCalledWith(
      expect.stringMatching(/^unsubscribe-request:[a-f0-9]{64}$/),
      '1',
      { nx: true, ex: 900 },
    )
  })

  it('claims and releases a hashed subscription request key', async () => {
    const owner = await claimSubscribeRequest('user@example.com')
    expect(owner).toMatch(/^[\w-]+$/)
    expect(mockRedisSet).toHaveBeenCalledWith(
      expect.stringMatching(/^subscribe-request:[a-f0-9]{64}$/),
      owner,
      { nx: true, ex: 60 },
    )

    await releaseSubscribeRequest('user@example.com', owner!)
    expect(mockRedisEval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('get', KEYS[1])"),
      [expect.stringMatching(/^subscribe-request:[a-f0-9]{64}$/)],
      [owner],
    )

    expect(await renewSubscribeRequest('user@example.com', owner!)).toBe(true)
    expect(mockRedisEval).toHaveBeenLastCalledWith(
      expect.stringContaining("redis.call('expire', KEYS[1], 60)"),
      [expect.stringMatching(/^subscribe-request:[a-f0-9]{64}$/)],
      [owner],
    )
  })

  it('rate limits a hashed IP using shared storage', async () => {
    expect(await isUnsubscribeRequestRateLimited('192.0.2.1')).toBe(false)
    expect(mockRateLimit).toHaveBeenCalledOnce()
    expect(mockRateLimit).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/))

    mockRateLimit.mockClear()
    mockRateLimit.mockResolvedValueOnce({ success: false })
    expect(await isUnsubscribeRequestRateLimited(null)).toBe(true)
    expect(mockRateLimit).toHaveBeenCalledOnce()
    expect(mockRateLimit).toHaveBeenCalledWith('global')
  })

  it('applies global and hashed-IP subscription limits', async () => {
    expect(await isSubscribeRequestRateLimited('192.0.2.1')).toBe(false)
    expect(mockRateLimit).toHaveBeenCalledOnce()
    expect(mockRateLimit).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/))

    mockRateLimit.mockClear()
    mockRateLimit.mockResolvedValueOnce({ success: false })
    expect(await isSubscribeRequestRateLimited(null)).toBe(true)
    expect(mockRateLimit).toHaveBeenCalledOnce()
    expect(mockRateLimit).toHaveBeenCalledWith('global')
  })

  it('applies a global fallback to unsubscribe token submissions', async () => {
    mockRateLimit.mockResolvedValueOnce({ success: false })

    expect(await isUnsubscribeTokenRateLimited(null)).toBe(true)
    expect(mockRateLimit).toHaveBeenCalledWith('global')
  })

  it('releases the same shared cooldown key', async () => {
    await releaseUnsubscribeRequestCooldown('user@example.com')
    expect(mockRedisDel).toHaveBeenCalledWith(
      expect.stringMatching(/^unsubscribe-request:[a-f0-9]{64}$/),
    )
  })

  it('sends a signed unsubscribe URL to the subscriber', async () => {
    const fetchMock = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => {
      return new Response(null, { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    expect(await sendUnsubscribeLinkEmail('user@example.com')).toBe(true)

    const [, init] = fetchMock.mock.calls[0]
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    const payload = JSON.parse(init?.body as string) as {
      email: string
      addToAudience: boolean
      dataVariables: { unsubscribeUrl: string }
    }
    const unsubscribeUrl = new URL(payload.dataVariables.unsubscribeUrl)
    const credentials = new URLSearchParams(unsubscribeUrl.hash.slice(1))
    expect(payload.email).toBe('user@example.com')
    expect(payload.addToAudience).toBe(false)
    expect(unsubscribeUrl.origin).toBe('https://www.librechat.ai')
    expect(unsubscribeUrl.pathname).toBe('/unsubscribe')
    expect(unsubscribeUrl.search).toBe('')
    expect(credentials.get('email')).toBe('user@example.com')
    expect(credentials.get('token')).toMatch(/^\d+\.\d+\.[\w-]+\.[\w-]+$/)
  })

  it('returns false when Loops delivery throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('network failure'))),
    )

    expect(await sendUnsubscribeLinkEmail('user@example.com')).toBe(false)
  })
})
