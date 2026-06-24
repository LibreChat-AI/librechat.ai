import type { DefaultTokenizer, DefaultTokenizerConfig } from '@orama/orama'
import { normalizeToken } from '@orama/orama/internals'

const tokenizerLanguage = 'korean'
const fallbackTokenPattern = /[\u3131-\u318e\uac00-\ud7a3]+|[A-Za-z0-9_'-]+/g
const koreanSegmenter =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('ko', { granularity: 'word' })
    : undefined

type KoreanTokenizerConfig = Omit<DefaultTokenizerConfig, 'language' | 'stemming' | 'stemmer'> & {
  language?: typeof tokenizerLanguage
}

function trim(text: string[]): string[] {
  while (text[text.length - 1] === '') {
    text.pop()
  }
  while (text[0] === '') {
    text.shift()
  }
  return text
}

function resolveStopWords(
  stopWords: KoreanTokenizerConfig['stopWords'],
): DefaultTokenizer['stopWords'] {
  if (stopWords === false) return undefined
  if (Array.isArray(stopWords)) return stopWords
  if (typeof stopWords === 'function') return stopWords([])
  return []
}

function tokenizeKorean(input: string): string[] {
  const text = input.toLowerCase()

  if (koreanSegmenter) {
    return Array.from(koreanSegmenter.segment(text))
      .filter((segment) => segment.isWordLike)
      .map((segment) => segment.segment)
  }

  return text.match(fallbackTokenPattern) ?? []
}

function tokenizeInternal(
  this: DefaultTokenizer,
  input: string,
  _language?: string,
  prop?: string,
  withCache = true,
): string[] {
  if (typeof input !== 'string') {
    return [input]
  }

  const normalize = this.normalizeToken.bind(this, prop ?? '')
  const tokens =
    prop && this.tokenizeSkipProperties.has(prop)
      ? [normalize(input.toLowerCase(), withCache)]
      : tokenizeKorean(input)
          .map((token) => normalize(token, withCache))
          .filter(Boolean)

  const trimTokens = trim(tokens)

  if (!this.allowDuplicates) {
    return Array.from(new Set(trimTokens))
  }

  return trimTokens
}

export function createKoreanTokenizer(config: KoreanTokenizerConfig = {}): DefaultTokenizer {
  const tokenizerConfig: DefaultTokenizer = {
    tokenize: tokenizeInternal,
    language: config.language ?? tokenizerLanguage,
    stemmerSkipProperties: new Set(
      config.stemmerSkipProperties ? [config.stemmerSkipProperties].flat() : [],
    ),
    tokenizeSkipProperties: new Set(
      config.tokenizeSkipProperties ? [config.tokenizeSkipProperties].flat() : [],
    ),
    stopWords: resolveStopWords(config.stopWords),
    allowDuplicates: Boolean(config.allowDuplicates),
    normalizeToken,
    normalizationCache: new Map(),
  }

  tokenizerConfig.tokenize = tokenizeInternal.bind(tokenizerConfig)

  return tokenizerConfig
}
