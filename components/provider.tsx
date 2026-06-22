'use client'
import { RootProvider } from 'fumadocs-ui/provider'
import { I18nProvider } from 'fumadocs-ui/i18n'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { i18n, LOCALE_NAMES } from '@/lib/i18n'
import { getFumadocsText } from '@/lib/ui-i18n'

const locales = i18n.languages.map((locale) => ({
  locale,
  name: LOCALE_NAMES[locale] ?? locale,
}))

/**
 * Site-wide Fumadocs provider. The search dialog is mounted by RootProvider's
 * SearchProvider at the root, above every route's own I18nProvider, so without
 * a locale here its chrome — most visibly the search input placeholder — always
 * renders in English even on localized pages. Wrap RootProvider in an
 * I18nProvider keyed to the URL locale so the dialog follows the page language.
 * The wrapper sits *outside* RootProvider because the dialog is a descendant of
 * SearchProvider, not of `children`. Per-page concerns (the language switcher's
 * onChange and the available-locales list) are still owned by the nested
 * Docs/Home I18nProviders, which override this one inside their subtrees.
 */
export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const first = pathname.split('/').filter(Boolean)[0] ?? ''
  const locale = i18n.languages.includes(first) ? first : i18n.defaultLanguage

  return (
    <I18nProvider locale={locale} locales={locales} translations={getFumadocsText(locale)}>
      <RootProvider
        search={{
          enabled: true,
        }}
      >
        {children}
      </RootProvider>
    </I18nProvider>
  )
}
