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

describe('POST /api/unsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsRateLimited.mockReturnValue(false)
    supabaseClient = createSupabaseMock()
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

  it('returns 400 when email is missing', async () => {
    const response = await POST(jsonRequest('https://example.com/api/unsubscribe', {}))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ message: 'Invalid email format' })
  })

  it('returns 400 when email is invalid', async () => {
    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'not-valid' }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toEqual({ message: 'Invalid email format' })
  })

  it('returns 503 when Supabase is not configured', async () => {
    supabaseClient = null

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({ message: 'Unsubscription service is not configured' })
  })

  it('returns 404 when the subscriber does not exist', async () => {
    supabaseClient = createSupabaseMock({ existing: null, fetchError: true })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'missing@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toEqual({ message: 'Subscriber not found' })
  })

  it('unsubscribes an existing subscriber', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'User@Example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ message: 'Unsubscription successful' })
    expect(supabaseClient.update).toHaveBeenCalledWith({ status: 'unsubscribed' })
    expect(supabaseClient.eqAfterUpdate).toHaveBeenCalledWith('email', 'user@example.com')
  })

  it('returns 500 when update fails', async () => {
    supabaseClient = createSupabaseMock({
      existing: { id: '1', status: 'subscribed' },
      updateError: true,
    })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe', { email: 'user@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ message: 'Unsubscription failed' })
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
