'use client'

import { I18nProvider } from 'fumadocs-ui/i18n'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { i18n, LOCALE_NAMES } from '@/lib/i18n'
import { getFumadocsText } from '@/lib/ui-i18n'

const allLocales = i18n.languages.map((locale) => ({
  locale,
  name: LOCALE_NAMES[locale] ?? locale,
}))

/**
 * Wraps Fumadocs' I18nProvider with two changes to the language switcher:
 *
 * 1. Custom `onChange`: Fumadocs' default does `router.push()` AND
 *    `router.refresh()`. The refresh wipes the client Router Cache and forces a
 *    second, full server round-trip on every switch. It also always prefixes the
 *    locale, producing `/en/docs/...` for the default language — a non-canonical
 *    duplicate of the prefix-less English URL that isn't edge-cached. This
 *    handler does a single `push` and routes the default language back to its
 *    canonical, prefix-less URL.
 *
 * 2. Per-page locale list: only offer locales that actually have a translation
 *    for the page being viewed (`availableLocales`, keyed by slug-path), plus the
 *    current locale as a safety net. Without this the switcher lists every
 *    language and most pages are untranslated, so the choice just bounces the
 *    reader straight back to English.
 */
export function DocsI18nProvider({
  locale,
  availableLocales,
  children,
}: {
  locale: string
  availableLocales: Record<string, string[]>
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  // Slug-path of the current page: drop the locale prefix (when present) and the
  // leading `docs` segment. A docs slug never starts with a locale code, so the
  // first segment is a prefix only when it matches a configured language.
  const segments = pathname.split('/').filter(Boolean)
  if (i18n.languages.includes(segments[0])) segments.shift()
  const slug = segments.slice(1).join('/')

  const available = availableLocales[slug] ?? [i18n.defaultLanguage]
  const locales = allLocales.filter(
    (item) => available.includes(item.locale) || item.locale === locale,
  )

  const onChange = (next: string) => {
    const segs = pathname.split('/').filter(Boolean)
    if (i18n.languages.includes(segs[0])) segs.shift()
    const rest = segs.join('/')
    router.push(next === i18n.defaultLanguage ? `/${rest}` : `/${next}/${rest}`)
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
