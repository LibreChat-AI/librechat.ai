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
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    const { email } = body as { email: unknown }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { message: 'Unsubscription service is not configured' },
        { status: 503 },
      )
    }

    const normalized = normalizeEmail(email)

    const { data: subscriber, error: fetchError } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', normalized)
      .single()

    if (fetchError || !subscriber) {
      return NextResponse.json({ message: 'Subscriber not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', normalized)

    if (updateError) {
      console.error('Unsubscription error:', updateError.message)
      return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Unsubscription successful' }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
  }
}
