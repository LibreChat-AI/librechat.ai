import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { Redis } from '@upstash/redis'

const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function getSecret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET?.trim() || null
}

/** Whether UNSUBSCRIBE_SECRET is configured. Lets callers tell a genuine
 * misconfiguration apart from an invalid/missing token. */
export function isUnsubscribeConfigured(): boolean {
  return Boolean(
    getSecret() && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

function consumedTokenKey(token: string): string {
  return `unsubscribe-token-consumed:${createHash('sha256').update(token).digest('hex')}`
}

export async function consumeUnsubscribeToken(token: string): Promise<boolean> {
  const result = await Redis.fromEnv().set(consumedTokenKey(token), '1', {
    nx: true,
    ex: TOKEN_MAX_AGE_SECONDS,
  })
  return result === 'OK'
}

export async function releaseUnsubscribeToken(token: string): Promise<void> {
  await Redis.fromEnv().del(consumedTokenKey(token))
}

export function createUnsubscribeToken(email: string): string | null {
  const secret = getSecret()
  if (!secret) return null
  const issuedAt = Math.floor(Date.now() / 1000)
  const signature = createHmac('sha256', secret).update(`${email}:${issuedAt}`).digest('base64url')
  return `${issuedAt}.${signature}`
}

export function createUnsubscribeUrl(email: string, origin: string): string | null {
  const token = createUnsubscribeToken(email)
  if (!token) return null

  const url = new URL('/unsubscribe', origin)
  url.hash = new URLSearchParams({ email, token }).toString()
  return url.toString()
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const secret = getSecret()
  if (!secret) return false

  const [issuedAtValue, signature, extra] = token.split('.')
  if (!issuedAtValue || !signature || extra) return false
  const issuedAt = Number(issuedAtValue)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isSafeInteger(issuedAt) || issuedAt > now || now - issuedAt > TOKEN_MAX_AGE_SECONDS) {
    return false
  }

  const expected = createHmac('sha256', secret).update(`${email}:${issuedAt}`).digest('base64url')
  const actualBuffer = new TextEncoder().encode(signature)
  const expectedBuffer = new TextEncoder().encode(expected)
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}
