/**
 * Simple in-memory rate limiter with bounded map size.
 * Not shared across serverless invocations — serves as a best-effort
 * first line of defense. For production-grade limiting, use middleware
 * or a shared store (Redis/KV).
 */

const MAX_KEYS = 10_000

interface RateLimitEntry {
  count: number
  resetAt: number
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const map = new Map<string, RateLimitEntry>()

  function evict(now: number): void {
    // First pass: remove expired entries
    for (const [k, v] of map) {
      if (now > v.resetAt) map.delete(k)
    }
    // Hard cap: if still over limit after expiry sweep, clear entirely
    // to prevent unbounded growth from many unique keys within the window
    if (map.size > MAX_KEYS) {
      map.clear()
    }
  }

  return function isRateLimited(key: string): boolean {
    const now = Date.now()

    if (map.size > MAX_KEYS) {
      evict(now)
    }

    const entry = map.get(key)

    if (!entry || now > entry.resetAt) {
      map.set(key, { count: 1, resetAt: now + windowMs })
      return false
    }

    entry.count++
    return entry.count > maxRequests
  }
}

/**
 * Extract client IP from request headers.
 * Checks x-forwarded-for, x-real-ip, and cf-connecting-ip.
 * Returns 'unknown' as a fallback so rate limiting still applies.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return (
    request.headers.get('x-real-ip')?.trim() ??
    request.headers.get('cf-connecting-ip')?.trim() ??
    'unknown'
  )
}
