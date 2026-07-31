import { describe, expect, it } from 'vitest'
import { OPENROUTER_APP_HEADERS } from './openrouter-attribution'

describe('OpenRouter app attribution', () => {
  it('credits the established LibreChat app instead of creating a www alias', () => {
    expect(OPENROUTER_APP_HEADERS).toEqual({
      'HTTP-Referer': 'https://librechat.ai/',
      'X-OpenRouter-Title': 'LibreChat',
    })
  })
})
