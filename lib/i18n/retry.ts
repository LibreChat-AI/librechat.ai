/**
 * Retry helper for the translation pipeline. The translate model talks to
 * OpenRouter on the low-priority `flex` service tier, which returns 429s under
 * load; without retry/backoff a burst of rate-limit errors skips most pages and
 * forces the whole workflow to be re-run by hand. This converges a single run.
 */

/** HTTP status carried by an error, however the SDK/provider exposes it. */
function statusOf(err: unknown): number | undefined {
  const e = err as { statusCode?: unknown; status?: unknown; response?: { status?: unknown } }
  for (const v of [e?.statusCode, e?.status, e?.response?.status]) {
    if (typeof v === 'number') return v
  }
  return undefined
}

/** Response headers carried by an error, however the SDK/provider exposes them. */
function headersOf(err: unknown): Record<string, string> | undefined {
  const e = err as { responseHeaders?: unknown; response?: { headers?: unknown } }
  const h = (e?.responseHeaders ?? e?.response?.headers) as Record<string, string> | undefined
  return h && typeof h === 'object' ? h : undefined
}

/**
 * Whether an error is worth retrying: rate limits (429), request timeout (408),
 * and any 5xx (incl. 529 "overloaded"); the AI SDK's own `isRetryable` flag; and
 * transient network failures detected by message when no status is present.
 */
export function isRetryableError(err: unknown): boolean {
  if ((err as { isRetryable?: unknown })?.isRetryable === true) return true
  const status = statusOf(err)
  if (status !== undefined) return status === 408 || status === 429 || status >= 500
  const msg = (err instanceof Error ? err.message : String(err ?? '')).toLowerCase()
  return /rate.?limit|too many requests|timed? ?out|econnreset|etimedout|eai_again|enotfound|fetch failed|socket hang up|network|overloaded|temporarily/.test(
    msg,
  )
}

/**
 * Milliseconds to wait per a `Retry-After` header (seconds or HTTP-date), or
 * undefined when the header is absent/unparseable so the caller falls back to
 * exponential backoff.
 */
export function retryAfterMs(err: unknown, now: number = Date.now()): number | undefined {
  const headers = headersOf(err)
  const raw = headers?.['retry-after'] ?? headers?.['Retry-After']
  if (raw == null || raw === '') return undefined
  const seconds = Number(raw)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const when = Date.parse(String(raw))
  return Number.isFinite(when) ? Math.max(0, when - now) : undefined
}

export interface RetryOptions {
  /** Max retries after the first attempt (so total tries = retries + 1). */
  retries?: number
  /** Base for exponential backoff in ms (doubled each attempt). */
  baseDelayMs?: number
  /** Upper bound for a single backoff wait in ms. */
  maxDelayMs?: number
  /** Injectable for tests; defaults to setTimeout. */
  sleep?: (ms: number) => Promise<void>
  /** Injectable for tests; defaults to Math.random (jitter). */
  random?: () => number
  /** Observability hook fired before each backoff wait. */
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Run `fn`, retrying retryable failures with exponential backoff + jitter. A
 * `Retry-After` header, when present, overrides the computed backoff. Non-retryable
 * errors and an exhausted budget re-throw the original error.
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const retries = opts.retries ?? 6
  const base = opts.baseDelayMs ?? 1000
  const maxDelay = opts.maxDelayMs ?? 60_000
  const sleep = opts.sleep ?? defaultSleep
  const random = opts.random ?? Math.random

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= retries || !isRetryableError(err)) throw err
      const exp = Math.min(maxDelay, base * 2 ** attempt)
      // Full-ish jitter in [exp/2, exp] to avoid synchronized retries.
      const backoff = exp / 2 + random() * (exp / 2)
      const delayMs = retryAfterMs(err) ?? backoff
      opts.onRetry?.({ attempt: attempt + 1, delayMs, error: err })
      await sleep(delayMs)
    }
  }
}
