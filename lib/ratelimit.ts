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

  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'

  const { success, reset } = await limiter.limit(ip)

  if (!success) {
    return { allowed: false, reset }
  }

  return { allowed: true }
}
