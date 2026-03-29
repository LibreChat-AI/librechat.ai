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

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', normalized)
      .single()

    if (existing) {
      if (existing.status === 'subscribed') {
        return NextResponse.json({ message: 'Email already subscribed' }, { status: 409 })
      }

      // Re-subscribe if previously unsubscribed
      await supabase.from('subscribers').update({ status: 'subscribed' }).eq('email', normalized)

      return NextResponse.json({ message: 'Subscription successful' }, { status: 200 })
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({ email: normalized, status: 'subscribed' })

    if (error) {
      console.error('Subscription error:', error.message)
      return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscription successful' }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
  }
}
