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

  // Cloudflare fronts the origin (see next.config.mjs), so `cf-connecting-ip` is
  // the client address Cloudflare authenticates and a client cannot forge it.
  // In an X-Forwarded-For chain the right-most hop is the nearest proxy (shared
  // by every user) and the left-most is client-controlled, so neither end is a
  // safe key on its own. Fall back to the platform `x-real-ip`, then the
  // left-most XFF hop for local/non-proxied environments where limiting is
  // best-effort anyway.
  const ip =
    req.headers.get('cf-connecting-ip')?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  const { success, reset } = await limiter.limit(ip)

  if (!success) {
    return { allowed: false, reset }
  }

  return { allowed: true }
}
