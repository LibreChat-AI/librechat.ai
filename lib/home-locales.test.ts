import { describe, expect, it } from 'vitest'
import {
  hasLocalizedHome,
  i18n,
  LOCALIZED_HOME_LOCALES,
  localizedHomeAlternates,
  localizedHomeHref,
} from './i18n'

describe('localized home locales', () => {
  it('exposes home pages for every implemented locale', () => {
    expect([...LOCALIZED_HOME_LOCALES]).toEqual(i18n.languages)
  })

  it('localizes every non-default implemented home page', () => {
    for (const locale of i18n.languages.filter((lang) => lang !== i18n.defaultLanguage)) {
      expect(hasLocalizedHome(locale)).toBe(true)
      expect(localizedHomeHref(locale)).toBe(`/${locale}`)
      expect(localizedHomeAlternates()).toHaveProperty(locale, `/${locale}`)
    }
  })

  it('keeps existing localized home URLs stable', () => {
    expect(hasLocalizedHome('de')).toBe(true)
    expect(localizedHomeHref('de')).toBe('/de')
    expect(localizedHomeAlternates()).toMatchObject({ en: '/', de: '/de' })
  })
})
