'use client'

import { I18nProvider } from 'fumadocs-ui/contexts/i18n'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { i18n, LOCALIZED_HOME_LOCALES, LOCALE_NAMES, rememberLocale } from '@/lib/i18n'
import { uiI18n } from '@/lib/ui-i18n'

const locales = LOCALIZED_HOME_LOCALES.map((locale) => ({
  locale,
  name: LOCALE_NAMES[locale] ?? locale,
}))

/**
 * Language switcher context for the landing page. Mirrors DocsI18nProvider but
 * routes between the home URLs: the default language lives at `/` (no prefix,
 * matching hideLocale: 'default-locale') and translated home locales live at
 * `/<locale>`. Docs-only locales are omitted until their UI/home dictionary
 * exists, so the switcher never advertises an English fallback page as localized.
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
