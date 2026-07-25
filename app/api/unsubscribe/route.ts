import { NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import {
  claimSubscribeRequest,
  isUnsubscribeTokenRateLimited,
  releaseSubscribeRequest,
  renewSubscribeRequest,
} from '@/lib/newsletter-email'
import {
  consumeUnsubscribeToken,
  isUnsubscribeConfigured,
  releaseUnsubscribeToken,
  verifyUnsubscribeToken,
} from '@/lib/unsubscribe-token'

const isRateLimited = createRateLimiter(5, 60_000)

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (ip && isRateLimited(ip)) {
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
    if (await isUnsubscribeTokenRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    const normalized = normalizeEmail(email)
    if (!(await verifyUnsubscribeToken(normalized, token))) {
      return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
    }
    const lockOwner = await claimSubscribeRequest(normalized)
    if (!lockOwner) {
      return NextResponse.json(
        { message: 'Subscription update in progress; retry shortly' },
        { status: 409, headers: { 'Retry-After': '1' } },
      )
    }
    try {
      if (!(await verifyUnsubscribeToken(normalized, token))) {
        return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
      }
      if (!(await consumeUnsubscribeToken(token))) {
        return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
      }
      if (!(await renewSubscribeRequest(normalized, lockOwner))) {
        await releaseUnsubscribeToken(token).catch(() => undefined)
        return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
      }

      let updateError: { message: string } | null
      try {
        const result = await supabase
          .from('subscribers')
          .update({ status: 'unsubscribed' })
          .eq('email', normalized)
        updateError = result.error
      } catch (error) {
        await releaseUnsubscribeToken(token).catch(() => undefined)
        throw error
      }

      if (updateError) {
        await releaseUnsubscribeToken(token).catch(() => undefined)
        console.error('Unsubscription error:', updateError.message)
        return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Unsubscription request received' }, { status: 200 })
    } finally {
      await releaseSubscribeRequest(normalized, lockOwner).catch(() => undefined)
    }
  } catch {
    return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
  }
}
