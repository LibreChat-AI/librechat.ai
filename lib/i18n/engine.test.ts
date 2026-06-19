import { describe, it, expect } from 'vitest'
import { translate, buildSystemPrompt, stripWrappingFence, type TranslateModel } from './engine'

const echo: TranslateModel = { generate: async ({ prompt }) => prompt.split('\n').at(-1) ?? '' }

describe('engine', () => {
  it('buildSystemPrompt names the target language and lists glossary terms', () => {
    const sys = buildSystemPrompt('German', 'block')
    expect(sys).toContain('German')
    expect(sys).toContain('LibreChat')
  })

  it('stripWrappingFence removes a model-added wrapping fence', () => {
    expect(stripWrappingFence('```md\nhello\n```')).toBe('hello')
    expect(stripWrappingFence('hello')).toBe('hello')
  })

  it('translate passes the block to the model and returns its cleaned output', async () => {
    const out = await translate({ text: '# Hello', locale: 'de', kind: 'block', model: echo })
    expect(out).toBe('# Hello')
  })
})
