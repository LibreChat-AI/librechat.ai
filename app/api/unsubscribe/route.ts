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
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    if (!supabase) {
      return NextResponse.json(
        { message: 'Unsubscription service is not configured' },
        { status: 503 },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { data: subscriber, error: fetchError } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', normalizedEmail)
      .single()

    if (fetchError || !subscriber) {
      return NextResponse.json({ message: 'Subscriber not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed' })
      .eq('email', normalizedEmail)

    if (updateError) {
      console.error('Unsubscription error:', updateError.message)
      return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Unsubscription successful' }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 })
  }
}
