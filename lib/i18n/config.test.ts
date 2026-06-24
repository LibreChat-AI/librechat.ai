import { describe, it, expect, vi } from 'vitest'
import { TARGET_LOCALES, DEFAULT_LOCALE, TRANSLATE_MODEL, GLOSSARY } from './config'
import { MT_BANNER } from '../i18n'

describe('i18n config', () => {
  it('targets the configured non-default locales', () => {
    expect([...TARGET_LOCALES]).toEqual([
      'zh',
      'es',
      'fr',
      'de',
      'ja',
      'pt-BR',
      'it',
      'nl',
      'pl',
      'vi',
      'ko',
      'id',
      'tr',
    ])
    expect(DEFAULT_LOCALE).toBe('en')
  })

  it('defaults the model and keeps LibreChat in the glossary', () => {
    expect(TRANSLATE_MODEL.length).toBeGreaterThan(0)
    expect(GLOSSARY).toContain('LibreChat')
  })

  it('falls back to the default model when the env var is set but empty (CI unset-variable case)', async () => {
    const prev = process.env.OPENROUTER_TRANSLATE_MODEL
    process.env.OPENROUTER_TRANSLATE_MODEL = ''
    vi.resetModules()
    try {
      const { TRANSLATE_MODEL: model } = await import('./config')
      expect(model).toBe('google/gemini-3.1-flash-lite')
    } finally {
      if (prev === undefined) delete process.env.OPENROUTER_TRANSLATE_MODEL
      else process.env.OPENROUTER_TRANSLATE_MODEL = prev
      vi.resetModules()
    }
  })

  it('has a banner string for every target locale', () => {
    for (const locale of TARGET_LOCALES) {
      expect(MT_BANNER[locale]?.notice).toBeTruthy()
    }
  })
})
