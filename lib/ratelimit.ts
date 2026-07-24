import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Rate limiter for the AI chat endpoint.
 *
 * Only active when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Without them the app still works — just without rate limiting.
 *
 * Sliding window: 10 requests per 60 seconds per IP.
 */

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    timeout: 1000, // 1s — if Upstash is slow, allow the request through
    prefix: 'ratelimit:chat',
  })

  return ratelimit
}

export async function checkRateLimit(
  req: Request,
): Promise<{ allowed: true } | { allowed: false; reset: number }> {
  const limiter = getRatelimit()
  if (!limiter) return { allowed: true }

  // `cf-connecting-ip` is the client address Cloudflare authenticates and a
  // client cannot forge — but only when every request is guaranteed to reach
  // the app through Cloudflare. On a preview/platform hostname or a non-proxied
  // origin a client can set that header freely and rotate it for a fresh
  // allowance, so honor it only when the deployment asserts that guarantee via
  // TRUST_CF_CONNECTING_IP (production fronts the origin with Cloudflare, see
  // next.config.mjs). Otherwise fall back to the platform-set `x-real-ip`, then
  // the left-most X-Forwarded-For hop for local/non-proxied environments where
  // limiting is best-effort anyway. The right-most XFF hop is deliberately not
  // used: it is the nearest proxy's address, shared by every user behind it.
  const cfConnectingIp =
    process.env.TRUST_CF_CONNECTING_IP === 'true'
      ? req.headers.get('cf-connecting-ip')?.trim()
      : undefined
  const ip =
    cfConnectingIp ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  const { success, reset } = await limiter.limit(ip)

  if (!success) {
    return { allowed: false, reset }
  }

  return { allowed: true }
}
