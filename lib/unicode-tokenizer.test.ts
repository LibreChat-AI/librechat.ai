import { create, insert, search, type DefaultTokenizer } from '@orama/orama'
import { describe, expect, it } from 'vitest'
import {
  createKoreanTokenizer,
  createPolishTokenizer,
  createVietnameseTokenizer,
} from './unicode-tokenizer'

async function expectSearchMatch(tokenizer: DefaultTokenizer, text: string, term: string) {
  const db = await create({
    schema: { text: 'string' },
    components: { tokenizer },
  })

  await insert(db, { text })

  expect((await search(db, { term })).count).toBe(1)
}

describe('unicode tokenizers', () => {
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
    await expectSearchMatch(
      createKoreanTokenizer(),
      '한국어 검색 테스트 OpenAI endpoint 설정',
      '한국어',
    )
  })

  it('keeps Polish words whole before normalization', () => {
    const tokenizer = createPolishTokenizer()

    expect(tokenizer.tokenize('załączniki żółć łąka OpenAI endpoint')).toEqual([
      'zalaczniki',
      'zolc',
      'laka',
      'openai',
      'endpoint',
    ])
  })

  it('indexes and searches Polish prose', async () => {
    await expectSearchMatch(
      createPolishTokenizer(),
      'Konfiguracja załączniki żółć łąka OpenAI endpoint',
      'załączniki',
    )
  })

  it('keeps Vietnamese words whole before normalization', () => {
    const tokenizer = createVietnameseTokenizer()

    expect(tokenizer.tokenize('tiếng Việt đường dẫn OpenAI endpoint')).toEqual([
      'tiếng',
      'việt',
      'dường',
      'dẫn',
      'openai',
      'endpoint',
    ])
  })

  it('indexes and searches Vietnamese prose', async () => {
    await expectSearchMatch(
      createVietnameseTokenizer(),
      'Cấu hình tiếng Việt đường dẫn OpenAI endpoint',
      'tiếng',
    )
  })
})
