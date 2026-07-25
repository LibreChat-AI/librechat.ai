import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function getSecret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET?.trim() || null
}

/** Whether UNSUBSCRIBE_SECRET is configured. Lets callers tell a genuine
 * misconfiguration apart from an invalid/missing token. */
export function isUnsubscribeConfigured(): boolean {
  return getSecret() !== null
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
  url.searchParams.set('email', email)
  url.searchParams.set('token', token)
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
