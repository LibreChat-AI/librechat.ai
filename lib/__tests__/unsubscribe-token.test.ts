import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

describe('unsubscribe tokens', () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = 'unsubscribe-secret'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-25T12:00:00Z'))
  })

  afterEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET
    vi.useRealTimers()
  })

  it('accepts a current token', () => {
    const token = createUnsubscribeToken('user@example.com')

    expect(token).not.toBeNull()
    expect(verifyUnsubscribeToken('user@example.com', token!)).toBe(true)
  })

  it('rejects an expired token', () => {
    const token = createUnsubscribeToken('user@example.com')
    vi.advanceTimersByTime(7 * 24 * 60 * 60 * 1000 + 1000)

    expect(verifyUnsubscribeToken('user@example.com', token!)).toBe(false)
  })

  it('rejects tokens issued in the future', () => {
    const token = createUnsubscribeToken('user@example.com')
    vi.setSystemTime(new Date('2026-07-25T11:59:59Z'))

    expect(verifyUnsubscribeToken('user@example.com', token!)).toBe(false)
  })
})
