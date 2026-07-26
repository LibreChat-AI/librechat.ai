import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getClientIp } from '@/lib/rate-limit'

/**
 * Rate limiter for the AI chat endpoint.
 *
 * Only active when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Without them the app still works — just without rate limiting.
 *
 * Sliding window: 10 requests per 60 seconds per IP.
 * Client IP resolution is exposed via getClientIp for other API routes.
 * Per-client limiting is skipped when no authenticated ingress identity exists.
 */

let ratelimit: Ratelimit | null = null
let globalRatelimit: Ratelimit | null = null

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

function getGlobalRatelimit(): Ratelimit | null {
  if (globalRatelimit) return globalRatelimit
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null

  // A separate, higher-capacity deployment-wide bucket preserves protection
  // when no authenticated ingress can provide a trustworthy client IP.
  globalRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    timeout: 1000,
    prefix: 'ratelimit:chat-global',
  })

  return globalRatelimit
}

export async function checkRateLimit(
  req: Request,
): Promise<{ allowed: true } | { allowed: false; reset: number }> {
  const ip = getClientIp(req)
  const limiter = ip ? getRatelimit() : getGlobalRatelimit()
  if (!limiter) return { allowed: true }

  const { success, reset } = await limiter.limit(ip ?? 'global')

  if (!success) {
    return { allowed: false, reset }
  }

  return { allowed: true }
}
