import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock, jsonRequest } from '@/__tests__/helpers'

const mockIsIpRateLimited = vi.fn(() => false)
const mockClaimCooldown = vi.fn(async (_email: string) => true)
const mockReleaseCooldown = vi.fn(async (_email: string) => undefined)
const mockSendUnsubscribeLinkEmail = vi.fn(async (_email: string) => true)
let supabaseClient: ReturnType<typeof createSupabaseMock> | null = createSupabaseMock()

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => mockIsIpRateLimited,
  getClientIp: () => '127.0.0.1',
}))

vi.mock('@/lib/newsletter-email', () => ({
  claimUnsubscribeRequestCooldown: (email: string) => mockClaimCooldown(email),
  isUnsubscribeRequestConfigured: () => true,
  releaseUnsubscribeRequestCooldown: (email: string) => mockReleaseCooldown(email),
  sendUnsubscribeLinkEmail: (email: string) => mockSendUnsubscribeLinkEmail(email),
}))

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return {
    ...actual,
    after: (callback: () => void | Promise<void>) => {
      void callback()
    },
  }
})

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>()
  return {
    ...actual,
    getSupabaseClient: () => supabaseClient,
  }
})

const { POST } = await import('../route')

describe('POST /api/unsubscribe/request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsIpRateLimited.mockReturnValue(false)
    mockClaimCooldown.mockResolvedValue(true)
    mockSendUnsubscribeLinkEmail.mockResolvedValue(true)
    supabaseClient = createSupabaseMock()
  })

  it('sends a signed link to an existing subscriber', async () => {
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe/request', {
        email: 'User@Example.com',
      }),
    )

    expect(response.status).toBe(200)
    expect(mockSendUnsubscribeLinkEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('returns the same response without emailing a missing subscriber', async () => {
    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe/request', {
        email: 'missing@example.com',
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      message: 'If that address is subscribed, an unsubscribe link has been sent',
    })
    expect(mockSendUnsubscribeLinkEmail).not.toHaveBeenCalled()
  })

  it('silently throttles repeated recipient requests', async () => {
    mockClaimCooldown.mockResolvedValue(false)

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe/request', {
        email: 'user@example.com',
      }),
    )

    expect(response.status).toBe(200)
    expect(mockSendUnsubscribeLinkEmail).not.toHaveBeenCalled()
  })

  it('releases the recipient cooldown when delivery fails', async () => {
    mockSendUnsubscribeLinkEmail.mockResolvedValue(false)
    supabaseClient = createSupabaseMock({ existing: { id: '1', status: 'subscribed' } })

    await POST(
      jsonRequest('https://example.com/api/unsubscribe/request', {
        email: 'user@example.com',
      }),
    )

    expect(mockReleaseCooldown).toHaveBeenCalledWith('user@example.com')
  })

  it('releases the recipient cooldown when the subscriber lookup fails', async () => {
    supabaseClient = createSupabaseMock({ fetchError: true })

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe/request', {
        email: 'user@example.com',
      }),
    )

    expect(response.status).toBe(200)
    expect(mockReleaseCooldown).toHaveBeenCalledWith('user@example.com')
    expect(mockSendUnsubscribeLinkEmail).not.toHaveBeenCalled()
  })

  it('releases the recipient cooldown when the subscriber lookup rejects', async () => {
    supabaseClient!.maybeSingle.mockRejectedValue(new Error('lookup failed'))

    const response = await POST(
      jsonRequest('https://example.com/api/unsubscribe/request', {
        email: 'user@example.com',
      }),
    )

    expect(response.status).toBe(200)
    expect(mockReleaseCooldown).toHaveBeenCalledWith('user@example.com')
    expect(mockSendUnsubscribeLinkEmail).not.toHaveBeenCalled()
  })
})
