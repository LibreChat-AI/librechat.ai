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

function tokenGenerationKey(email: string): string {
  return `unsubscribe-token-generation:${createHash('sha256').update(email).digest('hex')}`
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

export function createUnsubscribeToken(email: string, generation = 1): string | null {
  const secret = getSecret()
  if (!secret) return null
  const issuedAt = Math.floor(Date.now() / 1000)
  const signature = createHmac('sha256', secret)
    .update(`${email}:${issuedAt}:${generation}`)
    .digest('base64url')
  return `${issuedAt}.${generation}.${signature}`
}

export async function createUnsubscribeUrl(email: string, origin: string): Promise<string | null> {
  const generationResult = await Redis.fromEnv().eval(
    "local generation = redis.call('incr', KEYS[1]); redis.call('expire', KEYS[1], ARGV[1]); return generation",
    [tokenGenerationKey(email)],
    [TOKEN_MAX_AGE_SECONDS],
  )
  const generation = Number(generationResult)
  if (!Number.isSafeInteger(generation) || generation < 1) return null
  const token = createUnsubscribeToken(email, generation)
  if (!token) return null

  const url = new URL('/unsubscribe', origin)
  url.hash = new URLSearchParams({ email, token }).toString()
  return url.toString()
}

export async function verifyUnsubscribeToken(email: string, token: string): Promise<boolean> {
  const secret = getSecret()
  if (!secret) return false

  const [issuedAtValue, generationValue, signature, extra] = token.split('.')
  if (!issuedAtValue || !generationValue || !signature || extra) return false
  if (!/^(0|[1-9]\d*)$/.test(issuedAtValue)) return false
  if (!/^[1-9]\d*$/.test(generationValue)) return false
  const issuedAt = Number(issuedAtValue)
  const generation = Number(generationValue)
  const now = Math.floor(Date.now() / 1000)
  if (
    !Number.isSafeInteger(issuedAt) ||
    String(issuedAt) !== issuedAtValue ||
    !Number.isSafeInteger(generation) ||
    String(generation) !== generationValue ||
    issuedAt > now ||
    now - issuedAt > TOKEN_MAX_AGE_SECONDS
  ) {
    return false
  }

  const expected = createHmac('sha256', secret)
    .update(`${email}:${issuedAt}:${generation}`)
    .digest('base64url')
  const actualBuffer = new TextEncoder().encode(signature)
  const expectedBuffer = new TextEncoder().encode(expected)
  const signatureValid =
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  if (!signatureValid) return false

  const currentGeneration = await Redis.fromEnv().get<number>(tokenGenerationKey(email))
  return currentGeneration !== null && String(currentGeneration) === generationValue
}
