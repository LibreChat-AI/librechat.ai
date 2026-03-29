import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Shared Supabase client factory.
 * Returns null when credentials are not configured (graceful degradation).
 * Caches the client instance to avoid creating a new connection per request.
 */
let cached: SupabaseClient | null | undefined

export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    cached = null
    return null
  }

  cached = createClient(url, key)
  return cached
}

/**
 * Email validation using a strict regex approximation.
 * Requires a valid local part, domain labels, and a TLD of at least 2 characters.
 * Stricter than the previous `^[^\s@]+@[^\s@]+\.[^\s@]+$` which accepted `a@b.c`.
 */
export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    email,
  )
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}
