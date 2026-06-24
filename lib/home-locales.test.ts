import { describe, expect, it } from 'vitest'
import {
  hasLocalizedHome,
  LOCALIZED_HOME_LOCALES,
  localizedHomeAlternates,
  localizedHomeHref,
} from './i18n'
import { UI_DICTIONARY_LOCALES } from './ui-i18n'

describe('localized home locales', () => {
  it('only exposes home pages for locales with full UI dictionaries', () => {
    expect([...LOCALIZED_HOME_LOCALES]).toEqual(UI_DICTIONARY_LOCALES)
  })

  it('does not expose docs-only locales as localized home pages', () => {
    expect(hasLocalizedHome('pt-BR')).toBe(false)
    expect(localizedHomeHref('pt-BR')).toBe('/')
    expect(localizedHomeAlternates()).not.toHaveProperty('pt-BR')
  })

  it('keeps translated home locales localized', () => {
    expect(hasLocalizedHome('de')).toBe(true)
    expect(localizedHomeHref('de')).toBe('/de')
    expect(localizedHomeAlternates()).toMatchObject({ en: '/', de: '/de' })
  })
})
