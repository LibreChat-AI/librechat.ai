import { docsSource } from '@/lib/source'
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
export const { GET } = createFromSource(docsSource, undefined, {
  localeMap: {
    en: 'english',
    es: 'spanish',
    fr: 'french',
    de: 'german',
    zh: { tokenizer: createMandarinTokenizer() },
    ja: { tokenizer: createJapaneseTokenizer() },
  },
})
