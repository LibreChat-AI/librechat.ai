import { docsSource } from '@/lib/source'
import { i18n } from '@/lib/i18n'
import { SEARCH_LANGUAGE_BY_LOCALE } from '@/lib/search-languages'
import { createFromSource, type ExportedData } from 'fumadocs-core/search/server'
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin'
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese'

// Per-locale static search index.
//
// The whole index is built ONCE at build time (createFromSource caches the
// server per loader) and this route emits one prerendered JSON file per locale
// — so a reader downloads only their own language (~2 MB gzipped, one Orama DB)
// instead of the ~14 MB / six-DB combined blob. The client points its `from` at
// /api/search/<locale> (see components/search-dialog.tsx).
//
// This replaced the dynamic `GET` that rebuilt every locale index inside the
// serverless function on each cold start, which exceeded the function's max
// duration and returned 504s for every query in production.
export const revalidate = false
export const dynamicParams = false

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

// localeMap drives how each locale's index is tokenized at build time. Orama's
// built-in stemmers expect language names like "english", not locale codes.
// Chinese and Japanese use dedicated
// @orama/tokenizers via a top-level `tokenizer` field (createDB reads
// `tokenizer ?? components.tokenizer`). The client's initOrama MUST mirror this
// map so query tokenization matches how the documents were indexed.
//
// Restrict each non-default locale's index to pages that have a real translated
// file (path ends `.<locale>.mdx`). getLanguages() otherwise includes the English
// fallback for every untranslated page, and those hits resolve to /<locale>/docs/...
// URLs that immediately redirect to English (see the docs page route) — so
// localized search would surface results that bounce. Filtering keeps each locale's
// search consistent with what actually renders under /<locale>/docs/. The default
// language keeps every page.
const localeFilteredSource: typeof docsSource = {
  ...docsSource,
  getLanguages: () =>
    docsSource.getLanguages().map((entry) => ({
      language: entry.language,
      pages:
        entry.language === i18n.defaultLanguage
          ? entry.pages
          : entry.pages.filter((page) => page.path.endsWith(`.${entry.language}.mdx`)),
    })),
}

const searchServer = createFromSource(localeFilteredSource, {
  localeMap: {
    ...SEARCH_LANGUAGE_BY_LOCALE,
    zh: { tokenizer: createMandarinTokenizer() },
    ja: { tokenizer: createJapaneseTokenizer() },
  },
})

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const full = (await searchServer.export()) as ExportedData
  const locale = full.type === 'i18n' ? full.data[lang] : undefined
  // Keep the i18n envelope the static client expects; emit only this locale.
  return Response.json({ type: 'i18n', data: locale ? { [lang]: locale } : {} })
}
