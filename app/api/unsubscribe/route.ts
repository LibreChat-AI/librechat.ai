import { NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import { isUnsubscribeConfigured, verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

const isRateLimited = createRateLimiter(5, 60_000)

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || !('email' in body) || !('token' in body)) {
      return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
    }

    const { email, token } = body as { email: unknown; token: unknown }

    if (!email || typeof email !== 'string' || !isValidEmail(email) || typeof token !== 'string') {
      return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { message: 'Unsubscription service is not configured' },
        { status: 503 },
      )
    }

    // A missing UNSUBSCRIBE_SECRET is a server misconfiguration, not a bad
    // request: surface it as 503 so it is visible to operators instead of
    // silently rejecting every valid token as if it were forged.
    if (!isUnsubscribeConfigured()) {
      console.error('UNSUBSCRIBE_SECRET is not configured')
      return NextResponse.json(
        { message: 'Unsubscription service is not configured' },
        { status: 503 },
      )
    }

    const normalized = normalizeEmail(email)
    if (!verifyUnsubscribeToken(normalized, token)) {
      return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
    }

    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', normalized)

    if (updateError) {
      console.error('Unsubscription error:', updateError.message)
      return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
  }
}
