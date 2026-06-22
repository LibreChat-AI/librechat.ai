'use client'

import { I18nProvider } from 'fumadocs-ui/contexts/i18n'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { i18n, LOCALE_NAMES, rememberLocale } from '@/lib/i18n'
import { uiI18n } from '@/lib/ui-i18n'

const locales = i18n.languages.map((locale) => ({
  locale,
  name: LOCALE_NAMES[locale] ?? locale,
}))

/**
 * Language switcher context for the landing page. Mirrors DocsI18nProvider but
 * routes between the home URLs: the default language lives at `/` (no prefix,
 * matching hideLocale: 'default-locale') and every other locale at `/<locale>`.
 * The whole landing page is translated for all locales, so the switcher offers
 * them all.
 */
export function HomeI18nProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const router = useRouter()
  const onLocaleChange = (next: string) => {
    // Record the explicit choice so the `/` auto-detect honors it next time.
    rememberLocale(next)
    router.push(next === i18n.defaultLanguage ? '/' : `/${next}`)
  }

  return (
    <I18nProvider {...uiI18n.provider(locale)} locales={locales} onLocaleChange={onLocaleChange}>
      {children}
    </I18nProvider>
  )
}
