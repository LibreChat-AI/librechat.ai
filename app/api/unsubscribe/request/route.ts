import { after, NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { getClientIp } from '@/lib/rate-limit'
import {
  claimUnsubscribeRequestCooldown,
  isUnsubscribeRequestConfigured,
  isUnsubscribeRequestRateLimited,
  releaseUnsubscribeRequestCooldown,
  sendUnsubscribeLinkEmail,
} from '@/lib/newsletter-email'

const response = { message: 'If that address is subscribed, an unsubscribe link has been sent' }

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
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
    if (await isUnsubscribeRequestRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }
    if (!(await claimUnsubscribeRequestCooldown(normalized))) {
      return NextResponse.json(response)
    }

    let subscriber: { id: string } | null
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('id')
        .eq('email', normalized)
        .eq('status', 'subscribed')
        .maybeSingle()
      if (error) {
        await releaseUnsubscribeRequestCooldown(normalized)
        return NextResponse.json(response)
      }
      subscriber = data
    } catch {
      await releaseUnsubscribeRequestCooldown(normalized)
      return NextResponse.json(response)
    }

    after(async () => {
      if (!subscriber) return
      const sent = await sendUnsubscribeLinkEmail(normalized)
      if (!sent) await releaseUnsubscribeRequestCooldown(normalized)
    })
    return NextResponse.json(response)
  } catch {
    return NextResponse.json(response)
  }
}
