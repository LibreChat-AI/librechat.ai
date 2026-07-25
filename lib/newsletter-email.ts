import { createHash } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createUnsubscribeUrl } from '@/lib/unsubscribe-token'

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

let unsubscribeRequestIpLimiter: Ratelimit | null = null
let subscribeRequestIpLimiter: Ratelimit | null = null
let subscribeRequestGlobalLimiter: Ratelimit | null = null

export async function isSubscribeRequestRateLimited(ip: string | null): Promise<boolean> {
  subscribeRequestGlobalLimiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    prefix: 'ratelimit:subscribe-global',
  })
  const globalResult = await subscribeRequestGlobalLimiter.limit('global')
  if (!globalResult.success) return true
  if (!ip) return false

  subscribeRequestIpLimiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'ratelimit:subscribe-ip',
  })
  const ipResult = await subscribeRequestIpLimiter.limit(hashIdentifier(ip))
  return !ipResult.success
}

export async function isUnsubscribeRequestIpRateLimited(ip: string): Promise<boolean> {
  unsubscribeRequestIpLimiter ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'ratelimit:unsubscribe-request',
  })
  const { success } = await unsubscribeRequestIpLimiter.limit(hashIdentifier(ip))
  return !success
}

export async function claimUnsubscribeRequestCooldown(email: string): Promise<boolean> {
  const result = await Redis.fromEnv().set(unsubscribeRequestKey(email), '1', {
    nx: true,
    ex: 15 * 60,
  })
  return result === 'OK'
}

export async function releaseUnsubscribeRequestCooldown(email: string): Promise<void> {
  await Redis.fromEnv().del(unsubscribeRequestKey(email))
}

export async function sendUnsubscribeLinkEmail(email: string): Promise<boolean> {
  try {
    const apiKey = process.env.LOOPS_API_KEY?.trim()
    const transactionalId = process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID?.trim()
    const publicUrl = process.env.NEWSLETTER_PUBLIC_URL?.trim()
    const unsubscribeUrl = publicUrl ? createUnsubscribeUrl(email, publicUrl) : null
    if (!apiKey || !transactionalId || !unsubscribeUrl) return false

    const response = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        transactionalId,
        addToAudience: false,
        dataVariables: { unsubscribeUrl },
      }),
    })

    return response.ok
  } catch {
    return false
  }
}
