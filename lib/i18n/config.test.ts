import { describe, it, expect } from 'vitest'
import { TARGET_LOCALES, DEFAULT_LOCALE, TRANSLATE_MODEL, GLOSSARY } from './config'
import { MT_BANNER } from '../i18n'

describe('i18n config', () => {
  it('targets the five non-default locales', () => {
    expect([...TARGET_LOCALES]).toEqual(['zh', 'es', 'fr', 'de', 'ja'])
    expect(DEFAULT_LOCALE).toBe('en')
  })

  it('defaults the model and keeps LibreChat in the glossary', () => {
    expect(TRANSLATE_MODEL.length).toBeGreaterThan(0)
    expect(GLOSSARY).toContain('LibreChat')
  })

  it('has a banner string for every target locale', () => {
    for (const locale of TARGET_LOCALES) {
      expect(MT_BANNER[locale]?.notice).toBeTruthy()
    }
  })
})
