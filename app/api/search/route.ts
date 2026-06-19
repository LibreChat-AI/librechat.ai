import { docsSource } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'
import { createTokenizer as createMandarinTokenizer } from '@orama/tokenizers/mandarin'
import { createTokenizer as createJapaneseTokenizer } from '@orama/tokenizers/japanese'

export const revalidate = false

// Built-in Orama languages cover en/es/fr/de. Chinese and Japanese need the
// dedicated @orama/tokenizers so the i18n loader can build their indexes.
// The localeMap entry shape is Partial<AdvancedOptions>, which has a top-level
// `tokenizer` field (not nested under `components`).
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
