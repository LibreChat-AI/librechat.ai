import { describe, expect, it } from 'vitest'
import { i18n } from './i18n'
import { SEARCH_LANGUAGE_BY_LOCALE } from './search-languages'

const CUSTOM_TOKENIZER_LOCALES = new Set(['zh', 'ja'])

describe('search locale languages', () => {
  it('maps every locale that does not use a custom tokenizer', () => {
    for (const locale of i18n.languages) {
      if (CUSTOM_TOKENIZER_LOCALES.has(locale)) continue

      expect(SEARCH_LANGUAGE_BY_LOCALE[locale], locale).toBeTruthy()
    }
  })

  it('uses supported Orama language names for added locales', () => {
    expect(SEARCH_LANGUAGE_BY_LOCALE['pt-BR']).toBe('portuguese')
    expect(SEARCH_LANGUAGE_BY_LOCALE.it).toBe('italian')
    expect(SEARCH_LANGUAGE_BY_LOCALE.nl).toBe('dutch')
    expect(SEARCH_LANGUAGE_BY_LOCALE.id).toBe('indonesian')
    expect(SEARCH_LANGUAGE_BY_LOCALE.tr).toBe('turkish')
  })
})
