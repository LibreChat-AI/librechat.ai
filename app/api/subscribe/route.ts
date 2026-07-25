import { NextResponse } from 'next/server'
import { getSupabaseClient, isValidEmail, normalizeEmail } from '@/lib/supabase'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import {
  claimSubscribeRequest,
  isSubscribeRequestConfigured,
  isSubscribeRequestRateLimited,
  releaseSubscribeRequest,
  renewSubscribeRequest,
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
    const lockOwner = await claimSubscribeRequest(normalized)
    if (!lockOwner) {
      return NextResponse.json(
        { message: 'Subscription request already in progress' },
        { status: 409 },
      )
    }
    let leaseValid = true
    const leaseRenewal = setInterval(() => {
      void renewSubscribeRequest(normalized, lockOwner)
        .then((renewed) => {
          leaseValid &&= renewed
        })
        .catch(() => {
          leaseValid = false
        })
    }, 20_000)
    leaseRenewal.unref()
    const renewLease = async () => {
      if (!leaseValid || !(await renewSubscribeRequest(normalized, lockOwner))) {
        leaseValid = false
        return false
      }
      return true
    }
    try {
      // Read subscriber state only after acquiring the per-recipient lock.
      const { data: existing, error: lookupError } = await supabase
        .from('subscribers')
        .select('id, status')
        .eq('email', normalized)
        .maybeSingle()
      if (lookupError) {
        return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
      }

      if (existing) {
        if (existing.status === 'subscribed') {
          return NextResponse.json({ message: 'Email already subscribed' }, { status: 409 })
        }

        if (existing.status !== 'pending') {
          if (existing.status !== 'unsubscribed' || !(await renewLease())) {
            return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
          }
          const { data: pending, error: transitionError } = await supabase
            .from('subscribers')
            .update({ status: 'pending' })
            .eq('email', normalized)
            .eq('status', 'unsubscribed')
            .select('id')
            .maybeSingle()
          if (transitionError) {
            return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
          }
          if (!pending) {
            return NextResponse.json({ message: 'Email already subscribed' }, { status: 409 })
          }
        }
      } else {
        if (!(await renewLease())) {
          return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
        }

        // Keep incomplete delivery recoverable instead of recording a
        // subscription before its signed unsubscribe link is available.
        const { error } = await supabase
          .from('subscribers')
          .insert({ email: normalized, status: 'pending' })

        if (error) {
          console.error('Subscription error:', error.message)
          return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
        }
      }

      if (!(await renewLease())) {
        return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
      }
      const delivered = await sendUnsubscribeLinkEmail(normalized, true)
      if (!(await renewLease())) {
        return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
      }
      if (!delivered) {
        // A failed compensation can safely leave `pending`: the next request
        // retries delivery instead of treating the address as subscribed.
        const { error: rollbackError } = existing
          ? await supabase
              .from('subscribers')
              .update({ status: 'unsubscribed' })
              .eq('email', normalized)
              .eq('status', 'pending')
          : await supabase
              .from('subscribers')
              .delete()
              .eq('email', normalized)
              .eq('status', 'pending')
        if (rollbackError) {
          console.error('Subscription rollback error:', rollbackError.message)
        }
        return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
      }

      const { data: subscribed, error: finalizeError } = await supabase
        .from('subscribers')
        .update({ status: 'subscribed' })
        .eq('email', normalized)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()
      if (finalizeError) {
        return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
      }
      if (!subscribed) {
        return NextResponse.json({ message: 'Email already subscribed' }, { status: 409 })
      }

      return NextResponse.json(
        { message: 'Subscription successful' },
        { status: existing ? 200 : 201 },
      )
    } finally {
      clearInterval(leaseRenewal)
      await releaseSubscribeRequest(normalized, lockOwner).catch(() => undefined)
    }
  } catch {
    return NextResponse.json({ message: 'Subscription failed' }, { status: 500 })
  }
}
