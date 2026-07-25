import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock, jsonRequest } from '@/__tests__/helpers'

const mockIsRateLimited = vi.fn(() => false)
const mockGetClientIp = vi.fn((_request: Request) => '127.0.0.1')
const mockIsNewsletterEmailConfigured = vi.fn(() => true)
const mockSendUnsubscribeLinkEmail = vi.fn(async (_email: string) => true)
let supabaseClient: ReturnType<typeof createSupabaseMock> | null = createSupabaseMock()

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => mockIsRateLimited,
  getClientIp: (request: Request) => mockGetClientIp(request),
}))

vi.mock('@/lib/newsletter-email', () => ({
  isNewsletterEmailConfigured: () => mockIsNewsletterEmailConfigured(),
  sendUnsubscribeLinkEmail: (email: string) => mockSendUnsubscribeLinkEmail(email),
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
    mockIsNewsletterEmailConfigured.mockReturnValue(true)
    mockSendUnsubscribeLinkEmail.mockResolvedValue(true)
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

  it('returns 503 when unsubscribe email delivery is not configured', async () => {
    mockIsNewsletterEmailConfigured.mockReturnValue(false)

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ message: 'Subscription service is not configured' })
  })

  it('returns 409 when the email is already subscribed', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body).toEqual({ message: 'Email already subscribed' })
    expect(mockSendUnsubscribeLinkEmail).not.toHaveBeenCalled()
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
    expect(supabaseClient.eqAfterConditionalUpdate).toHaveBeenCalledWith('status', 'unsubscribed')
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
    expect(mockSendUnsubscribeLinkEmail).toHaveBeenCalledWith('new@example.com')
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

  it('does not create a subscriber when email delivery fails', async () => {
    mockSendUnsubscribeLinkEmail.mockResolvedValue(false)
    supabaseClient = createSupabaseMock({ existing: null })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'new@example.com' }),
    )

    expect(response.status).toBe(500)
    expect(supabaseClient.insert).toHaveBeenCalled()
    expect(supabaseClient.deleteRows).toHaveBeenCalled()
  })

  it('restores unsubscribed status when re-subscription email delivery fails', async () => {
    mockSendUnsubscribeLinkEmail.mockResolvedValue(false)
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'unsubscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )

    expect(response.status).toBe(500)
    expect(supabaseClient.update).toHaveBeenNthCalledWith(1, { status: 'subscribed' })
    expect(supabaseClient.update).toHaveBeenNthCalledWith(2, { status: 'unsubscribed' })
    expect(supabaseClient.eqAfterUpdate).toHaveBeenLastCalledWith('id', '1')
    expect(supabaseClient.eqAfterConditionalUpdate).toHaveBeenLastCalledWith('status', 'subscribed')
  })

  it('does not roll back a resubscription transition owned by another request', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'unsubscribed' } })
    supabaseClient.maybeSingleAfterUpdate.mockResolvedValue({ data: null, error: null })

    const response = await POST(
      jsonRequest('https://example.com/api/subscribe', { email: 'user@example.com' }),
    )

    expect(response.status).toBe(409)
    expect(mockSendUnsubscribeLinkEmail).not.toHaveBeenCalled()
    expect(supabaseClient.update).toHaveBeenCalledTimes(1)
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
