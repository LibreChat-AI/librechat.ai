import { describe, it, expect } from 'vitest'
import {
  translate,
  buildSystemPrompt,
  stripWrappingFence,
  outputTokenBudget,
  type TranslateModel,
} from './engine'

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

  it('stripWrappingFence leaves a body containing real interior fences intact', () => {
    // Two genuine code blocks: the regex would otherwise span them and drop the
    // middle fence/prose. Must be returned unchanged.
    const s = '```js\na\n```\n\nprose\n\n```js\nb\n```'
    expect(stripWrappingFence(s)).toBe(s)
  })

  it('translate passes the block to the model and returns its cleaned output', async () => {
    const out = await translate({ text: '# Hello', locale: 'de', kind: 'block', model: echo })
    expect(out).toBe('# Hello')
  })

  it('translate passes a non-empty system prompt naming the target language', async () => {
    let captured: { system: string; prompt: string } | undefined
    const capturing: TranslateModel = {
      generate: async (input) => {
        captured = input
        return input.prompt
      },
    }
    await translate({ text: '# Hello', locale: 'de', kind: 'block', model: capturing })
    expect(captured?.system).toBeTruthy()
    expect(captured?.system).toContain(buildSystemPrompt('Deutsch', 'block'))
  })

  it('outputTokenBudget scales with the block and stays far below the context window', () => {
    // Unbounded, the provider reserves its whole 65536-token window per request,
    // which inflates the credit hold on every call regardless of block size.
    expect(outputTokenBudget('Hi')).toBe(512)
    expect(outputTokenBudget('x'.repeat(600))).toBe(1800)
    expect(outputTokenBudget('x'.repeat(100_000))).toBe(8192)
  })

  it('translate caps the output budget for the block it sends', async () => {
    let captured: { maxOutputTokens?: number } | undefined
    const capturing: TranslateModel = {
      generate: async (input) => {
        captured = input
        return input.prompt
      },
    }
    await translate({ text: '# Hello', locale: 'de', kind: 'block', model: capturing })
    expect(captured?.maxOutputTokens).toBe(outputTokenBudget('# Hello'))
  })
})
