import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isNewsletterEmailConfigured, sendNewsletterWelcomeEmail } from '@/lib/newsletter-email'

describe('newsletter unsubscribe email', () => {
  beforeEach(() => {
    process.env.LOOPS_API_KEY = 'loops-key'
    process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID = 'transactional-id'
    process.env.UNSUBSCRIBE_SECRET = 'unsubscribe-secret'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.LOOPS_API_KEY
    delete process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID
    delete process.env.UNSUBSCRIBE_SECRET
  })

  it('requires all email and signing configuration', () => {
    expect(isNewsletterEmailConfigured()).toBe(true)
    delete process.env.UNSUBSCRIBE_SECRET
    expect(isNewsletterEmailConfigured()).toBe(false)
  })

  it('sends a signed unsubscribe URL to the subscriber', async () => {
    const fetchMock = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => {
      return new Response(null, { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    expect(await sendNewsletterWelcomeEmail('user@example.com')).toBe(true)

    const [, init] = fetchMock.mock.calls[0]
    const payload = JSON.parse(init?.body as string) as {
      email: string
      dataVariables: { unsubscribeUrl: string }
    }
    const unsubscribeUrl = new URL(payload.dataVariables.unsubscribeUrl)
    expect(payload.email).toBe('user@example.com')
    expect(unsubscribeUrl.origin).toBe('https://www.librechat.ai')
    expect(unsubscribeUrl.pathname).toBe('/unsubscribe')
    expect(unsubscribeUrl.searchParams.get('email')).toBe('user@example.com')
    expect(unsubscribeUrl.searchParams.get('token')).toMatch(/^[\w-]+$/)
  })
})
