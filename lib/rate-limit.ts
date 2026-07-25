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
 * Extract a rate-limit key from request client IP headers.
 *
 * `cf-connecting-ip` is only trusted when TRUST_CF_CONNECTING_IP=true (every
 * request is guaranteed to arrive through Cloudflare). Otherwise every
 * request uses the same fallback bucket: on a directly reachable origin,
 * x-real-ip and X-Forwarded-For are requester-controlled and cannot safely
 * identify a client.
 */
export function getClientIp(request: Request): string {
  if (process.env.TRUST_CF_CONNECTING_IP !== 'true') return 'unknown'
  return request.headers.get('cf-connecting-ip')?.trim() || 'unknown'
}
