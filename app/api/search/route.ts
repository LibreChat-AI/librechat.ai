import { docsSource } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'

export const revalidate = false

// Map each docs locale to an Orama-supported tokenizer language. Spanish,
// French, and German are built in; Chinese and Japanese need @orama/tokenizers
// (mandarin/japanese), so until those are wired up they fall back to english
// tokenization. Without this the i18n loader makes Orama throw
// LANGUAGE_NOT_SUPPORTED while building the zh/ja indexes.
export const { GET } = createFromSource(docsSource, undefined, {
  localeMap: {
    en: 'english',
    es: 'spanish',
    fr: 'french',
    de: 'german',
    zh: 'english',
    ja: 'english',
  },
})
