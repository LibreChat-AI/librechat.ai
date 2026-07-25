import { after, NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import {
  claimUnsubscribeRequestCooldown,
  isUnsubscribeRequestConfigured,
  sendUnsubscribeLinkEmail,
} from '@/lib/newsletter-email'

const isIpRateLimited = createRateLimiter(5, 60_000)
const response = { message: 'If that address is subscribed, an unsubscribe link has been sent' }

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (ip && isIpRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || !('email' in body)) {
      return NextResponse.json(response)
    }

    const { email } = body as { email: unknown }
    if (typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json(response)
    }

    const normalized = normalizeEmail(email)

    const supabase = getSupabaseClient()
    if (!supabase || !isUnsubscribeRequestConfigured()) {
      return NextResponse.json(
        { message: 'Unsubscription service is not configured' },
        { status: 503 },
      )
    }
    if (!(await claimUnsubscribeRequestCooldown(normalized))) {
      return NextResponse.json(response)
    }

    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', normalized)
      .eq('status', 'subscribed')
      .maybeSingle()

    after(async () => {
      if (subscriber) await sendUnsubscribeLinkEmail(normalized)
    })
    return NextResponse.json(response)
  } catch {
    return NextResponse.json(response)
  }
}
