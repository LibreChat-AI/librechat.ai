import { docsSource } from '@/lib/source'
import { i18n } from '@/lib/i18n'

/**
 * Map of docs slug-path -> locales that have a REAL translated file
 * (`foo.<locale>.mdx`), always including the default language. Pages whose only
 * available locale is the default are omitted, so a lookup miss means
 * "English only".
 *
 * Same discriminator as generateStaticParams and the hreflang gate: getPage
 * falls back to the English file for a missing locale (path ends `.mdx`), while
 * a real translation's path ends `.<locale>.mdx`.
 *
 * Used to filter the language switcher per page so it never offers a locale that
 * would just bounce the reader back to English.
 */
let cached: Record<string, string[]> | null = null

export function getAvailableLocalesBySlug(): Record<string, string[]> {
  if (cached) return cached

  const map: Record<string, string[]> = {}
  const nonDefault = i18n.languages.filter((l) => l !== i18n.defaultLanguage)

  for (const page of docsSource.getPages(i18n.defaultLanguage)) {
    const locales = [i18n.defaultLanguage]
    for (const locale of nonDefault) {
      const translated = docsSource.getPage(page.slugs, locale)
      if (translated?.file.path.endsWith(`.${locale}.mdx`)) locales.push(locale)
    }
    if (locales.length > 1) map[page.slugs.join('/')] = locales
  }

  cached = map
  return map
}
