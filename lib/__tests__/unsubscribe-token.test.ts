import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  consumeUnsubscribeToken,
  createUnsubscribeToken,
  releaseUnsubscribeToken,
  verifyUnsubscribeToken,
} from '@/lib/unsubscribe-token'

const mockRedisSet = vi.fn(async () => 'OK')
const mockRedisDel = vi.fn(async () => 1)

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({ set: mockRedisSet, del: mockRedisDel }),
  },
}))

describe('unsubscribe tokens', () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = 'unsubscribe-secret'
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token'
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-25T12:00:00Z'))
  })

  afterEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
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

  it('rejects non-canonical timestamp representations', () => {
    const token = createUnsubscribeToken('user@example.com')!
    const [timestamp, signature] = token.split('.')

    expect(verifyUnsubscribeToken('user@example.com', `0${timestamp}.${signature}`)).toBe(false)
    expect(verifyUnsubscribeToken('user@example.com', `+${timestamp}.${signature}`)).toBe(false)
  })

  it('records and releases consumed tokens by hash', async () => {
    const token = createUnsubscribeToken('user@example.com')!

    expect(await consumeUnsubscribeToken(token)).toBe(true)
    expect(mockRedisSet).toHaveBeenCalledWith(
      expect.stringMatching(/^unsubscribe-token-consumed:[a-f0-9]{64}$/),
      '1',
      { nx: true, ex: 604800 },
    )

    await releaseUnsubscribeToken(token)
    expect(mockRedisDel).toHaveBeenCalledWith(
      expect.stringMatching(/^unsubscribe-token-consumed:[a-f0-9]{64}$/),
    )
  })
})
