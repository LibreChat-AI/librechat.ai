import type { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { i18n, LOCALIZED_HOME_LOCALES, LOCALE_COOKIE } from '@/lib/i18n'
import { preferredLocale } from '../proxy'

function requestWithPreferences({
  cookie,
  acceptLanguage,
}: {
  cookie?: string
  acceptLanguage?: string
}): NextRequest {
  return {
    cookies: {
      get: (name: string) => (name === LOCALE_COOKIE && cookie ? { value: cookie } : undefined),
    },
    headers: {
      get: (name: string) => (name.toLowerCase() === 'accept-language' ? acceptLanguage : null),
    },
  } as unknown as NextRequest
}

describe('preferredLocale', () => {
  it('treats docs-only locale cookies as an explicit default-home preference', () => {
    const request = requestWithPreferences({
      cookie: 'pt-BR',
      acceptLanguage: 'de-DE,de;q=0.9',
    })

    expect(preferredLocale(request, LOCALIZED_HOME_LOCALES)).toBe(i18n.defaultLanguage)
  })

  it('uses Accept-Language when there is no locale cookie', () => {
    const request = requestWithPreferences({ acceptLanguage: 'de-DE,de;q=0.9' })

    expect(preferredLocale(request, LOCALIZED_HOME_LOCALES)).toBe('de')
  })

  it('ignores invalid locale cookies', () => {
    const request = requestWithPreferences({
      cookie: 'not-a-locale',
      acceptLanguage: 'fr-FR,fr;q=0.9',
    })

    expect(preferredLocale(request, LOCALIZED_HOME_LOCALES)).toBe('fr')
  })
})
