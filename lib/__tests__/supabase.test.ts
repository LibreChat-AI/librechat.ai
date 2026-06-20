import { describe, expect, it } from 'vitest'
import { isValidEmail, normalizeEmail } from '@/lib/supabase'

describe('isValidEmail', () => {
  it('accepts well-formed addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('first.last+tag@mail.example.co.uk')).toBe(true)
  })

  it('rejects malformed addresses', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('missing-at.example.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('a@b.c')).toBe(false)
  })
})

describe('normalizeEmail', () => {
  it('lowercases and trims the address', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com')
  })
})
