import { create, insert, search } from '@orama/orama'
import { describe, expect, it } from 'vitest'
import { createKoreanTokenizer } from './korean-tokenizer'

describe('korean tokenizer', () => {
  it('preserves Hangul and ASCII tokens', () => {
    const tokenizer = createKoreanTokenizer()

    expect(tokenizer.tokenize('한국어 검색 테스트 OpenAI endpoint 설정')).toEqual([
      '한국어',
      '검색',
      '테스트',
      'openai',
      'endpoint',
      '설정',
    ])
  })

  it('indexes and searches Korean prose', async () => {
    const db = await create({
      schema: { text: 'string' },
      components: { tokenizer: createKoreanTokenizer() },
    })

    await insert(db, { text: '한국어 검색 테스트 OpenAI endpoint 설정' })

    expect((await search(db, { term: '한국어' })).count).toBe(1)
    expect((await search(db, { term: 'OpenAI' })).count).toBe(1)
  })
})
