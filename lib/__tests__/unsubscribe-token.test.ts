import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activateUnsubscribeToken,
  consumeUnsubscribeToken,
  createUnsubscribeToken,
  releaseUnsubscribeToken,
  verifyUnsubscribeToken,
} from '@/lib/unsubscribe-token'

const mockRedisSet = vi.fn(async () => 'OK')
const mockRedisDel = vi.fn(async () => 1)
const mockRedisGet = vi.fn(async () => 1)
const mockRedisEval = vi.fn(async () => 1)

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      set: mockRedisSet,
      del: mockRedisDel,
      get: mockRedisGet,
      eval: mockRedisEval,
    }),
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

  it('accepts a current token', async () => {
    const token = createUnsubscribeToken('user@example.com')

    expect(token).not.toBeNull()
    expect(await verifyUnsubscribeToken('user@example.com', token!)).toBe(true)
  })

  it('rejects an expired token', async () => {
    const token = createUnsubscribeToken('user@example.com')
    vi.advanceTimersByTime(7 * 24 * 60 * 60 * 1000 + 1000)

    expect(await verifyUnsubscribeToken('user@example.com', token!)).toBe(false)
  })

  it('rejects tokens issued in the future', async () => {
    const token = createUnsubscribeToken('user@example.com')
    vi.setSystemTime(new Date('2026-07-25T11:59:59Z'))

    expect(await verifyUnsubscribeToken('user@example.com', token!)).toBe(false)
  })

  it('rejects non-canonical timestamp representations', async () => {
    const token = createUnsubscribeToken('user@example.com')!
    const [timestamp, generation, tokenId, signature] = token.split('.')

    expect(
      await verifyUnsubscribeToken(
        'user@example.com',
        `0${timestamp}.${generation}.${tokenId}.${signature}`,
      ),
    ).toBe(false)
    expect(
      await verifyUnsubscribeToken(
        'user@example.com',
        `+${timestamp}.${generation}.${tokenId}.${signature}`,
      ),
    ).toBe(false)
  })

  it('rejects tokens from an earlier subscription generation', async () => {
    const token = createUnsubscribeToken('user@example.com', 1)!
    mockRedisGet.mockResolvedValueOnce(2)

    expect(await verifyUnsubscribeToken('user@example.com', token)).toBe(false)
  })

  it('activates a delivered token generation', async () => {
    const token = createUnsubscribeToken('user@example.com', 2)!

    expect(await activateUnsubscribeToken('user@example.com', token)).toBe(true)
    expect(mockRedisEval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('set', KEYS[1], ARGV[1])"),
      [expect.stringMatching(/^unsubscribe-token-generation:[a-f0-9]{64}$/)],
      ['2'],
    )
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
