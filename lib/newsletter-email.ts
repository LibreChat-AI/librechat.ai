import { createHash, randomUUID } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { activateUnsubscribeToken, createUnsubscribeUrl } from '@/lib/unsubscribe-token'

export function isNewsletterEmailConfigured(): boolean {
  return Boolean(
    process.env.LOOPS_API_KEY?.trim() &&
    process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID?.trim() &&
    process.env.UNSUBSCRIBE_SECRET?.trim() &&
    process.env.NEWSLETTER_PUBLIC_URL?.trim(),
  )
}

export function isUnsubscribeRequestConfigured(): boolean {
  return Boolean(
    isNewsletterEmailConfigured() &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

export const isSubscribeRequestConfigured = isUnsubscribeRequestConfigured

function hashIdentifier(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function unsubscribeRequestKey(email: string): string {
  return `unsubscribe-request:${hashIdentifier(email)}`
}

function subscribeRequestKey(email: string): string {
  return `subscribe-request:${hashIdentifier(email)}`
}

let unsubscribeRequestIpLimiter: Ratelimit | null = null
let unsubscribeRequestGlobalLimiter: Ratelimit | null = null
let unsubscribeTokenIpLimiter: Ratelimit | null = null
let unsubscribeTokenGlobalLimiter: Ratelimit | null = null
let subscribeRequestIpLimiter: Ratelimit | null = null
let subscribeRequestGlobalLimiter: Ratelimit | null = null

export async function isSubscribeRequestRateLimited(ip: string | null): Promise<boolean> {
  if (ip) {
    subscribeRequestIpLimiter ??= new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'ratelimit:subscribe-ip',
    })
    const ipResult = await subscribeRequestIpLimiter.limit(hashIdentifier(ip))
    return !ipResult.success
  }

  subscribeRequestGlobalLimiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'ratelimit:subscribe-global',
  })
  const globalResult = await subscribeRequestGlobalLimiter.limit('global')
  return !globalResult.success
}

export async function isUnsubscribeRequestRateLimited(ip: string | null): Promise<boolean> {
  if (ip) {
    unsubscribeRequestIpLimiter ??= new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'ratelimit:unsubscribe-request',
    })
    const ipResult = await unsubscribeRequestIpLimiter.limit(hashIdentifier(ip))
    return !ipResult.success
  }

  unsubscribeRequestGlobalLimiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'ratelimit:unsubscribe-request-global',
  })
  const globalResult = await unsubscribeRequestGlobalLimiter.limit('global')
  return !globalResult.success
}

export async function isUnsubscribeTokenRateLimited(ip: string | null): Promise<boolean> {
  if (ip) {
    unsubscribeTokenIpLimiter ??= new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'ratelimit:unsubscribe-token',
    })
    const ipResult = await unsubscribeTokenIpLimiter.limit(hashIdentifier(ip))
    return !ipResult.success
  }

  unsubscribeTokenGlobalLimiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'ratelimit:unsubscribe-token-global',
  })
  const globalResult = await unsubscribeTokenGlobalLimiter.limit('global')
  return !globalResult.success
}

export async function claimUnsubscribeRequestCooldown(email: string): Promise<boolean> {
  const result = await Redis.fromEnv().set(unsubscribeRequestKey(email), '1', {
    nx: true,
    ex: 15 * 60,
  })
  return result === 'OK'
}

export async function claimSubscribeRequest(email: string): Promise<string | null> {
  const owner = randomUUID()
  const result = await Redis.fromEnv().set(subscribeRequestKey(email), owner, {
    nx: true,
    ex: 60,
  })
  return result === 'OK' ? owner : null
}

export async function renewSubscribeRequest(email: string, owner: string): Promise<boolean> {
  const result = await Redis.fromEnv().eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('expire', KEYS[1], 60) else return 0 end",
    [subscribeRequestKey(email)],
    [owner],
  )
  return result === 1
}

export async function releaseSubscribeRequest(email: string, owner: string): Promise<void> {
  await Redis.fromEnv().eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
    [subscribeRequestKey(email)],
    [owner],
  )
}

export async function releaseUnsubscribeRequestCooldown(email: string): Promise<void> {
  await Redis.fromEnv().del(unsubscribeRequestKey(email))
}

export async function sendUnsubscribeLinkEmail(
  email: string,
  advanceGeneration = false,
): Promise<boolean> {
  try {
    const apiKey = process.env.LOOPS_API_KEY?.trim()
    const transactionalId = process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID?.trim()
    const publicUrl = process.env.NEWSLETTER_PUBLIC_URL?.trim()
    const unsubscribeUrl = publicUrl
      ? await createUnsubscribeUrl(email, publicUrl, advanceGeneration)
      : null
    if (!apiKey || !transactionalId || !unsubscribeUrl) return false

    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      signal: AbortSignal.timeout(45_000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        transactionalId,
        // Loops transactional emails can be sent to recipients outside the
        // Audience, so do not create a marketing contact as a side effect.
        addToAudience: false,
        dataVariables: { unsubscribeUrl },
      }),
    })

    if (!response.ok) return false

    const token = new URLSearchParams(new URL(unsubscribeUrl).hash.slice(1)).get('token')
    return Boolean(token && (!advanceGeneration || (await activateUnsubscribeToken(email, token))))
  } catch {
    return false
  }
}
