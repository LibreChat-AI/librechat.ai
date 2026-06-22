'use client'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { i18n } from '@/lib/i18n'
import { uiI18n } from '@/lib/ui-i18n'

// Static search dialog (downloads the build-time index and queries client-side).
// Lazy so the Orama client and CJK tokenizer dictionaries stay out of the
// global bundle and only load when a reader opens search.
const SearchDialog = dynamic(() => import('@/components/search-dialog'))

/**
 * Site-wide Fumadocs provider. The search dialog is mounted here (by the
 * RootProvider's SearchProvider), above every route's per-page i18n provider, so
 * without a locale here its chrome — placeholder, aria-labels — always renders
 * in English even on localized pages. Derive the active locale from the URL and
 * pass `uiI18n.provider(locale)` to RootProvider so the dialog and all base
 * chrome follow the page language. Per-page concerns (the language switcher's
 * locale list and routing) are owned by the nested Docs/Home i18n providers,
 * which override this one inside their subtrees.
 */
export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const first = pathname.split('/').filter(Boolean)[0] ?? ''
  const locale = i18n.languages.includes(first) ? first : i18n.defaultLanguage

  return (
    <RootProvider i18n={uiI18n.provider(locale)} search={{ enabled: true, SearchDialog }}>
      {children}
    </RootProvider>
  )
}
