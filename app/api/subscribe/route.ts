import { NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

const isRateLimited = createRateLimiter(5, 60_000)

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || !('email' in body)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 422 })
    }

    const { email } = body as { email: unknown }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 422 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { message: 'Subscription service is not configured' },
        { status: 503 },
      )
    }

    const normalized = normalizeEmail(email)

    // Atomic upsert — single round trip, no race condition
    const { error } = await supabase
      .from('subscribers')
      .upsert({ email: normalized, status: 'subscribed' }, { onConflict: 'email' })

    if (error) {
      console.error('Subscription error:', error.message)
      return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscription successful' }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
  }
}
