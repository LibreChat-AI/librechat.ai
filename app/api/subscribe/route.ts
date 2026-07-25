import { NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import {
  claimSubscribeRequest,
  isSubscribeRequestConfigured,
  isSubscribeRequestRateLimited,
  releaseSubscribeRequest,
  sendUnsubscribeLinkEmail,
} from '@/lib/newsletter-email'

const isRateLimited = createRateLimiter(5, 60_000)
const isFallbackRateLimited = createRateLimiter(100, 60_000)

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if ((ip && isRateLimited(ip)) || (!ip && isFallbackRateLimited('global'))) {
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

    if (!supabase || !isSubscribeRequestConfigured()) {
      return NextResponse.json(
        { message: 'Subscription service is not configured' },
        { status: 503 },
      )
    }
    if (await isSubscribeRequestRateLimited(ip)) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
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
      if (!(await claimSubscribeRequest(normalized))) {
        return NextResponse.json(
          { message: 'Subscription request already in progress' },
          { status: 409 },
        )
      }
      try {
        if (!(await sendUnsubscribeLinkEmail(normalized))) {
          return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
        }
        const { data: transitioned, error: transitionError } = await supabase
          .from('subscribers')
          .update({ status: 'subscribed' })
          .eq('email', normalized)
          .eq('status', 'unsubscribed')
          .select('id')
          .maybeSingle()
        if (transitionError) {
          return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
        }
        if (!transitioned) {
          return NextResponse.json({ message: 'Email already subscribed' }, { status: 409 })
        }
        return NextResponse.json({ message: 'Subscription successful' }, { status: 200 })
      } finally {
        await releaseSubscribeRequest(normalized).catch(() => undefined)
      }
    }

    if (!(await claimSubscribeRequest(normalized))) {
      return NextResponse.json(
        { message: 'Subscription request already in progress' },
        { status: 409 },
      )
    }
    try {
      if (!(await sendUnsubscribeLinkEmail(normalized))) {
        return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
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
    } finally {
      await releaseSubscribeRequest(normalized).catch(() => undefined)
    }
  } catch {
    return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
  }
}
