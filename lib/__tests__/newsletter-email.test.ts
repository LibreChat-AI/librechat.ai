import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  claimUnsubscribeRequestCooldown,
  isNewsletterEmailConfigured,
  isUnsubscribeRequestConfigured,
  isUnsubscribeRequestIpRateLimited,
  releaseUnsubscribeRequestCooldown,
  sendUnsubscribeLinkEmail,
} from '@/lib/newsletter-email'

const mockRedisSet = vi.fn(async () => 'OK')
const mockRedisDel = vi.fn(async () => 1)
const mockRateLimit = vi.fn(async () => ({ success: true }))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn(() => 'sliding-window')
    limit = mockRateLimit
  },
}))

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({ set: mockRedisSet, del: mockRedisDel }),
  },
}))

describe('newsletter unsubscribe email', () => {
  beforeEach(() => {
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

  it('claims a hashed shared cooldown key', async () => {
    expect(await claimUnsubscribeRequestCooldown('user@example.com')).toBe(true)
    expect(mockRedisSet).toHaveBeenCalledWith(
      expect.stringMatching(/^unsubscribe-request:[a-f0-9]{64}$/),
      '1',
      { nx: true, ex: 900 },
    )
  })

  it('rate limits a hashed IP using shared storage', async () => {
    mockRateLimit.mockResolvedValueOnce({ success: false })

    expect(await isUnsubscribeRequestIpRateLimited('192.0.2.1')).toBe(true)
    expect(mockRateLimit).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/))
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
    const payload = JSON.parse(init?.body as string) as {
      email: string
      addToAudience: boolean
      dataVariables: { unsubscribeUrl: string }
    }
    const unsubscribeUrl = new URL(payload.dataVariables.unsubscribeUrl)
    expect(payload.email).toBe('user@example.com')
    expect(payload.addToAudience).toBe(false)
    expect(unsubscribeUrl.origin).toBe('https://www.librechat.ai')
    expect(unsubscribeUrl.pathname).toBe('/unsubscribe')
    expect(unsubscribeUrl.searchParams.get('email')).toBe('user@example.com')
    expect(unsubscribeUrl.searchParams.get('token')).toMatch(/^[\w-]+$/)
  })

  it('returns false when Loops delivery throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('network failure'))),
    )

    expect(await sendUnsubscribeLinkEmail('user@example.com')).toBe(false)
  })
})
