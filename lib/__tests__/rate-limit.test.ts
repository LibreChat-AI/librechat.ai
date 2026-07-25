import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

describe('createRateLimiter', () => {
  it('allows requests within the limit', () => {
    const isRateLimited = createRateLimiter(3, 60_000)

    expect(isRateLimited('client-a')).toBe(false)
    expect(isRateLimited('client-a')).toBe(false)
    expect(isRateLimited('client-a')).toBe(false)
  })

  it('blocks requests that exceed the limit', () => {
    const isRateLimited = createRateLimiter(2, 60_000)

    expect(isRateLimited('client-b')).toBe(false)
    expect(isRateLimited('client-b')).toBe(false)
    expect(isRateLimited('client-b')).toBe(true)
  })

  it('tracks limits independently per key', () => {
    const isRateLimited = createRateLimiter(1, 60_000)

    expect(isRateLimited('key-1')).toBe(false)
    expect(isRateLimited('key-2')).toBe(false)
    expect(isRateLimited('key-1')).toBe(true)
    expect(isRateLimited('key-2')).toBe(true)
  })

  it('resets the window after expiry', () => {
    vi.useFakeTimers()
    const isRateLimited = createRateLimiter(1, 1_000)

    expect(isRateLimited('client-c')).toBe(false)
    expect(isRateLimited('client-c')).toBe(true)

    vi.advanceTimersByTime(1_001)

    expect(isRateLimited('client-c')).toBe(false)
    vi.useRealTimers()
  })
})

describe('getClientIp', () => {
  const originalTrust = process.env.TRUST_CF_CONNECTING_IP

  afterEach(() => {
    if (originalTrust === undefined) delete process.env.TRUST_CF_CONNECTING_IP
    else process.env.TRUST_CF_CONNECTING_IP = originalTrust
  })

  it('ignores x-real-ip and x-forwarded-for without a trusted ingress', () => {
    delete process.env.TRUST_CF_CONNECTING_IP
    const request = new Request('https://example.com', {
      headers: {
        'x-real-ip': '198.51.100.42',
        'x-forwarded-for': '203.0.113.1, 10.0.0.1',
      },
    })

    expect(getClientIp(request)).toBeNull()
  })

  it('does not let a requester rotate the x-forwarded-for bucket', () => {
    delete process.env.TRUST_CF_CONNECTING_IP
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
    })

    expect(getClientIp(request)).toBeNull()
  })

  it('ignores cf-connecting-ip unless TRUST_CF_CONNECTING_IP is enabled', () => {
    delete process.env.TRUST_CF_CONNECTING_IP
    const request = new Request('https://example.com', {
      headers: {
        'cf-connecting-ip': '192.0.2.10',
        'x-real-ip': '198.51.100.42',
      },
    })

    expect(getClientIp(request)).toBeNull()
  })

  it('trusts cf-connecting-ip when TRUST_CF_CONNECTING_IP is true', () => {
    process.env.TRUST_CF_CONNECTING_IP = 'true'
    const request = new Request('https://example.com', {
      headers: {
        'cf-connecting-ip': '192.0.2.10',
        'x-real-ip': '198.51.100.42',
        'x-forwarded-for': '203.0.113.1',
      },
    })

    expect(getClientIp(request)).toBe('192.0.2.10')
  })

  it('returns null when no trusted ingress is configured', () => {
    delete process.env.TRUST_CF_CONNECTING_IP
    const request = new Request('https://example.com')

    expect(getClientIp(request)).toBeNull()
  })

  it('returns null when the trusted Cloudflare header is missing', () => {
    process.env.TRUST_CF_CONNECTING_IP = 'true'
    const request = new Request('https://example.com', {
      headers: { 'x-real-ip': '198.51.100.42' },
    })

    expect(getClientIp(request)).toBeNull()
  })
})
