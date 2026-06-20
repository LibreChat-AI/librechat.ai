import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock, jsonRequest } from '@/__tests__/helpers'

const mockIsRateLimited = vi.fn(() => false)
const mockGetClientIp = vi.fn((_request: Request) => '127.0.0.1')
let supabaseClient: ReturnType<typeof createSupabaseMock> | null = createSupabaseMock()

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

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsRateLimited.mockReturnValue(false)
    supabaseClient = createSupabaseMock()
  })

  it('returns 429 when rate limited', async () => {
    mockIsRateLimited.mockReturnValue(true)

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(429)
    expect(body).toEqual({ message: 'Too many requests' })
  })

  it('returns 422 when email is missing', async () => {
    const response = await POST(jsonRequest('https://example.com/api/subscribe', {}))
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body).toEqual({ message: 'Valid email is required' })
  })

  it('returns 422 when email is invalid', async () => {
    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'not-valid' }),
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body).toEqual({ message: 'Valid email is required' })
  })

  it('returns 503 when Supabase is not configured', async () => {
    supabaseClient = null

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({ message: 'Subscription service is not configured' })
  })

  it('returns 409 when the email is already subscribed', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body).toEqual({ message: 'Email already subscribed' })
  })

  it('re-subscribes a previously unsubscribed email', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'unsubscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'User@Example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Subscription successful' })
    expect(supabaseClient.update).toHaveBeenCalledWith({ status: 'subscribed' })
    expect(supabaseClient.eqAfterUpdate).toHaveBeenCalledWith('email', 'user@example.com')
  })

  it('creates a new subscriber', async () => {
    supabaseClient = createSupabaseMock({ existing: null })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'new@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual({ message: 'Subscription successful' })
    expect(supabaseClient.insert).toHaveBeenCalledWith({
      email: 'new@example.com',
      status: 'subscribed',
    })
  })

  it('returns 500 when insert fails', async () => {
    supabaseClient = createSupabaseMock({ existing: null, insertError: true })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'new@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ message: 'Subscription failed' })
  })

  it('returns 500 for malformed JSON', async () => {
    const response = await POST(
      new Request('https://example.com/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ message: 'Subscription failed' })
  })
})
