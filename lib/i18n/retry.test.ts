import { describe, it, expect } from 'vitest'
import { withRetry, isRetryableError, retryAfterMs } from './retry'

const noSleep = async () => {}

describe('isRetryableError', () => {
  it('treats 429, 408 and any 5xx as retryable', () => {
    expect(isRetryableError({ statusCode: 429 })).toBe(true)
    expect(isRetryableError({ statusCode: 408 })).toBe(true)
    expect(isRetryableError({ status: 503 })).toBe(true)
    expect(isRetryableError({ response: { status: 529 } })).toBe(true)
  })

  it('treats client errors other than 408/429 as non-retryable', () => {
    expect(isRetryableError({ statusCode: 400 })).toBe(false)
    expect(isRetryableError({ statusCode: 401 })).toBe(false)
    expect(isRetryableError({ statusCode: 404 })).toBe(false)
  })

  it('honors an explicit isRetryable flag from the AI SDK', () => {
    expect(isRetryableError({ isRetryable: true })).toBe(true)
  })

  it('detects transient network failures by message when no status is present', () => {
    expect(isRetryableError(new Error('fetch failed'))).toBe(true)
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true)
    expect(isRetryableError(new Error('Provider overloaded, please retry'))).toBe(true)
    expect(isRetryableError(new Error('invalid model id'))).toBe(false)
  })
})

describe('retryAfterMs', () => {
  it('parses a numeric seconds header', () => {
    expect(retryAfterMs({ responseHeaders: { 'retry-after': '2' } })).toBe(2000)
  })

  it('parses an HTTP-date header relative to the supplied now', () => {
    const now = 1_000_000
    const when = new Date(now + 5000).toUTCString()
    expect(retryAfterMs({ responseHeaders: { 'retry-after': when } }, now)).toBe(
      Date.parse(when) - now,
    )
  })

  it('returns undefined when the header is missing or unparseable', () => {
    expect(retryAfterMs({})).toBeUndefined()
    expect(retryAfterMs({ responseHeaders: { 'retry-after': 'soon' } })).toBeUndefined()
  })
})

describe('withRetry', () => {
  it('retries a retryable failure then returns the eventual success', async () => {
    let calls = 0
    const out = await withRetry(
      async () => {
        calls++
        if (calls < 3) throw { statusCode: 429 }
        return 'done'
      },
      { sleep: noSleep, random: () => 0 },
    )
    expect(out).toBe('done')
    expect(calls).toBe(3)
  })

  it('does not retry a non-retryable error', async () => {
    let calls = 0
    await expect(
      withRetry(
        async () => {
          calls++
          throw { statusCode: 400 }
        },
        { sleep: noSleep },
      ),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(calls).toBe(1)
  })

  it('gives up after the retry budget and rethrows the last error', async () => {
    let calls = 0
    await expect(
      withRetry(
        async () => {
          calls++
          throw { statusCode: 503 }
        },
        { retries: 2, sleep: noSleep, random: () => 0 },
      ),
    ).rejects.toMatchObject({ statusCode: 503 })
    expect(calls).toBe(3) // 1 initial attempt + 2 retries
  })

  it('waits the Retry-After duration when the header is present', async () => {
    const delays: number[] = []
    let calls = 0
    await withRetry(
      async () => {
        calls++
        if (calls < 2) throw { statusCode: 429, responseHeaders: { 'retry-after': '5' } }
        return 'ok'
      },
      {
        sleep: async (ms) => {
          delays.push(ms)
        },
        random: () => 0,
      },
    )
    expect(delays).toEqual([5000])
  })
})
