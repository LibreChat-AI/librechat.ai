'use client'

import { I18nProvider } from 'fumadocs-ui/i18n'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { i18n, LOCALE_NAMES } from '@/lib/i18n'
import { getFumadocsText } from '@/lib/ui-i18n'

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
  const onChange = (next: string) => {
    router.push(next === i18n.defaultLanguage ? '/' : `/${next}`)
  }

  return (
    <I18nProvider
      locale={locale}
      locales={locales}
      onChange={onChange}
      translations={getFumadocsText(locale)}
    >
      {children}
    </I18nProvider>
  )
}
