'use client'

import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { useDocsSearch } from 'fumadocs-core/search/client'
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static'
import { create, type AnyOrama } from '@orama/orama'
import { i18n } from '@/lib/i18n'
import { SEARCH_LANGUAGE_BY_LOCALE } from '@/lib/search-languages'
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search'

/**
 * Static search dialog.
 *
 * The per-locale Orama indexes are built at build time by
 * app/api/search/[lang]/route.ts; this component downloads only the current
 * reader's language (via `from`) and runs every query client-side. It mirrors
 * fumadocs' DefaultSearchDialog layout (so the UX is unchanged) but swaps the
 * fetch client for the static Orama client with a locale-aware `initOrama`.
 *
 * `initOrama` must reproduce the SAME tokenizer the route used to build each
 * locale's index, otherwise the query is tokenized differently from the stored
 * terms and matches nothing. The built-in static `initOrama` passes the raw
 * locale CODE ('en') to Orama as a language, which Orama rejects (it expects
 * 'english'), so a custom one is required here.
 */

async function initOrama(locale?: string): Promise<AnyOrama> {
  // Chinese/Japanese have no built-in stemmer. Load their (large) dictionaries
  // lazily so they only reach readers who actually search those locales.
  if (locale === 'zh') {
    const { createTokenizer } = await import('@orama/tokenizers/mandarin')
    return create({ schema: { _: 'string' }, components: { tokenizer: createTokenizer() } })
  }
  if (locale === 'ja') {
    const { createTokenizer } = await import('@orama/tokenizers/japanese')
    return create({ schema: { _: 'string' }, components: { tokenizer: createTokenizer() } })
  }
  return create({
    schema: { _: 'string' },
    language: SEARCH_LANGUAGE_BY_LOCALE[locale ?? 'en'] ?? 'english',
  })
}

export default function StaticSearchDialog(props: SharedProps) {
  const { locale } = useI18n()
  const lang = locale ?? i18n.defaultLanguage
  // Created inline (like fumadocs' DefaultSearchDialog); useDocsSearch tracks
  // re-queries via the client's `deps` ([tag, locale]), and the downloaded index
  // is cached module-side keyed by URL, so this stays cheap across renders.
  // `from` is the per-locale endpoint so we only download this reader's language.
  const client = oramaStaticClient({ from: `/api/search/${lang}`, initOrama, locale: lang })
  const { search, setSearch, query } = useDocsSearch({ client })

  return (
    <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data === 'empty' ? null : query.data} />
      </SearchDialogContent>
      <SearchDialogFooter />
    </SearchDialog>
  )
}
