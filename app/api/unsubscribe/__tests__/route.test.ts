import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock, jsonRequest } from '@/__tests__/helpers'
import { createUnsubscribeToken } from '@/lib/unsubscribe-token'

const mockIsRateLimited = vi.fn(() => false)
const mockGetClientIp = vi.fn((_request: Request) => '127.0.0.1')
const mockRedisSet = vi.fn(async (): Promise<string | null> => 'OK')
const mockRedisDel = vi.fn(async () => 1)
let supabaseClient: ReturnType<typeof createSupabaseMock> | null = createSupabaseMock()

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({ set: mockRedisSet, del: mockRedisDel }),
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => mockIsRateLimited,
  getClientIp: (request: Request) => mockGetClientIp(request),
}))

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>()
  return {
    ...actual,
    getSupabaseClient: () => supabaseClient,
  }
})

const { POST } = await import('../route')

describe('POST /api/unsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsRateLimited.mockReturnValue(false)
    mockRedisSet.mockResolvedValue('OK')
    supabaseClient = createSupabaseMock()
    process.env.UNSUBSCRIBE_SECRET = 'test-unsubscribe-secret'
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token'
  })

  it('returns 429 when rate limited', async () => {
    mockIsRateLimited.mockReturnValue(true)

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body).toEqual({ message: 'Too many requests' })
  })

  it('returns a generic response when email is missing', async () => {
    const response = await POST(jsonRequest('https://example.com/api/unsubscribe', {}))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Unsubscription request received' })
  })

  it('returns a generic response when email is invalid', async () => {
    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'not-valid' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Unsubscription request received' })
  })

  it('returns 503 when Supabase is not configured', async () => {
    supabaseClient = null

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'user@example.com',
        token: createUnsubscribeToken('user@example.com'),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({ message: 'Unsubscription service is not configured' })
  })

  it('returns 503 when the unsubscribe secret is not configured', async () => {
    delete process.env.UNSUBSCRIBE_SECRET
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'user@example.com',
        token: 'any-token',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({ message: 'Unsubscription service is not configured' })
    expect(supabaseClient.update).not.toHaveBeenCalled()
  })

  it('returns a generic response when the subscriber does not exist', async () => {
    supabaseClient = createSupabaseMock({ existing: null, fetchError: true })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'missing@example.com',
        token: createUnsubscribeToken('missing@example.com'),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Unsubscription request received' })
  })

  it('unsubscribes an existing subscriber', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'User@Example.com',
        token: createUnsubscribeToken('user@example.com'),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Unsubscription request received' })
    expect(supabaseClient.update).toHaveBeenCalledWith({ status: 'unsubscribed' })
    expect(supabaseClient.eqAfterUpdate).toHaveBeenCalledWith('email', 'user@example.com')
  })

  it('returns 500 when update fails', async () => {
    supabaseClient = createSupabaseMock({
      existing: { id: '1', status: 'subscribed' },
      updateError: true,
    })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'user@example.com',
        token: createUnsubscribeToken('user@example.com'),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ message: 'Unsubscription failed' })
  })

  it('releases the token when the subscriber update rejects', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })
    supabaseClient.eqAfterUpdate.mockRejectedValue(new Error('update failed'))

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'user@example.com',
        token: createUnsubscribeToken('user@example.com'),
      }),
    )

    expect(response.status).toBe(500)
    expect(mockRedisDel).toHaveBeenCalledWith(
      expect.stringMatching(/^unsubscribe-token-consumed:[a-f0-9]{64}$/),
    )
  })

  it('does not unsubscribe with an invalid token', async () => {
    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'user@example.com',
        token: 'invalid',
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ message: 'Unsubscription request received' })
    expect(supabaseClient?.update).not.toHaveBeenCalled()
  })

  it('does not replay a consumed token', async () => {
    mockRedisSet.mockResolvedValue(null)
    const token = createUnsubscribeToken('user@example.com')!

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', {
        email: 'user@example.com',
        token,
      }),
    )

    expect(response.status).toBe(200)
    expect(supabaseClient?.update).not.toHaveBeenCalled()
  })

  it('returns 500 for malformed JSON', async () => {
    const response = await POST(
      new Request('https://example.com/api/unsubscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ message: 'Unsubscription failed' })
  })
})
