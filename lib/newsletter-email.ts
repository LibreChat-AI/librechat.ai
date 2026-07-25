import { createUnsubscribeUrl } from '@/lib/unsubscribe-token'
import { SITE_URL } from '@/lib/structured-data'

export function isNewsletterEmailConfigured(): boolean {
  return Boolean(
    process.env.LOOPS_API_KEY?.trim() &&
    process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID?.trim() &&
    process.env.UNSUBSCRIBE_SECRET?.trim(),
  )
}

export async function sendNewsletterWelcomeEmail(email: string): Promise<boolean> {
  const apiKey = process.env.LOOPS_API_KEY?.trim()
  const transactionalId = process.env.LOOPS_UNSUBSCRIBE_TRANSACTIONAL_ID?.trim()
  const unsubscribeUrl = createUnsubscribeUrl(email, SITE_URL)
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
      addToAudience: true,
      dataVariables: { unsubscribeUrl },
    }),
  })

  return response.ok
}
