import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Valid email is required' }, { status: 422 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      // Supabase is not configured; return a placeholder success response
      return NextResponse.json(
        { message: 'Subscription service is not configured' },
        { status: 503 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', normalizedEmail)
      .single()

    if (existing) {
      if (existing.status === 'subscribed') {
        return NextResponse.json({ message: 'Email already subscribed' }, { status: 409 })
      }

      // Re-subscribe if previously unsubscribed
      await supabase
        .from('subscribers')
        .update({ status: 'subscribed' })
        .eq('email', normalizedEmail)

      return NextResponse.json({ message: 'Subscription successful' }, { status: 200 })
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('subscribers')
      .insert({ email: normalizedEmail, status: 'subscribed' })

    if (error) {
      console.error('Subscription error:', error.message)
      return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscription successful' }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
  }
}
