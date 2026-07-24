import { createHmac, timingSafeEqual } from 'node:crypto'

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
  return createHmac('sha256', secret).update(email).digest('base64url')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = createUnsubscribeToken(email)
  if (!expected) return false

  const actualBuffer = new TextEncoder().encode(token)
  const expectedBuffer = new TextEncoder().encode(expected)
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  )
}
