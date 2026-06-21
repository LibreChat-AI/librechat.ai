import { docsSource } from '@/lib/source'
import { i18n } from '@/lib/i18n'
import { createFromSource } from 'fumadocs-core/search/server'
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin'
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese'

export const revalidate = false

// Built-in Orama languages cover en/es/fr/de. Chinese and Japanese need the
// dedicated @orama/tokenizers so the i18n loader can build their indexes.
//
// The tokenizer is a TOP-LEVEL `tokenizer` field on the localeMap entry
// (Partial<AdvancedOptions>), NOT nested under `components`. This is correct for
// fumadocs-core 14.7.7: its i18n path spreads the localeMap object into the
// index builder (initAdvanced -> createDB in dist/search/server.js), which
// destructures the top-level `tokenizer` and passes it to Orama as
// `create({ components: { tokenizer } })`. A `components.tokenizer` shape (as in
// Fumadocs' newer client-side oramaStaticClient docs example) is a different,
// later API and is not how this server-side version consumes it.
//
// Version note: fumadocs-core 14.7.7 builds the index with Orama 2, while
// @orama/tokenizers is on 3.x. They are kept on 3.x deliberately: pinning the
// tokenizers to 2.x (the matched peer) makes the production build OOM because
// v2 bundles its large CJK dictionary. The v3 tokenizer object is duck-compatible
// here and the build succeeds; zh/ja tokenization is to be verified against real
// translated content during the first backfill. The proper long-term fix is to
// upgrade Fumadocs onto Orama 3.
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
          : entry.pages.filter((page) => page.file.path.endsWith(`.${entry.language}.mdx`)),
    })),
}

export const { GET } = createFromSource(localeFilteredSource, undefined, {
  localeMap: {
    en: 'english',
    es: 'spanish',
    fr: 'french',
    de: 'german',
    zh: { tokenizer: createMandarinTokenizer() },
    ja: { tokenizer: createJapaneseTokenizer() },
  },
})
