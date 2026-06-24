import type { DefaultTokenizer, DefaultTokenizerConfig } from '@orama/orama'
import { normalizeToken } from '@orama/orama/internals'

const unicodeTokenPattern = /[\p{L}\p{M}\p{N}_'-]+/gu
const koreanSegmenter =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('ko', { granularity: 'word' })
    : undefined

type UnicodeTokenizerConfig = Omit<DefaultTokenizerConfig, 'language' | 'stemming' | 'stemmer'>

type LocaleTokenizerConfig = UnicodeTokenizerConfig & {
  language: 'korean' | 'polish' | 'vietnamese'
  segmenter?: Intl.Segmenter
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
  stopWords: UnicodeTokenizerConfig['stopWords'],
): DefaultTokenizer['stopWords'] {
  if (stopWords === false) return undefined
  if (Array.isArray(stopWords)) return stopWords
  if (typeof stopWords === 'function') return stopWords([])
  return []
}

function tokenizeUnicode(input: string, segmenter?: Intl.Segmenter): string[] {
  const text = input.toLowerCase()

  if (segmenter) {
    return Array.from(segmenter.segment(text))
      .filter((segment) => segment.isWordLike)
      .map((segment) => segment.segment)
  }

  return text.match(unicodeTokenPattern) ?? []
}

function tokenizeInternal(
  this: DefaultTokenizer & { segmenter?: Intl.Segmenter },
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
      : tokenizeUnicode(input, this.segmenter)
          .map((token) => normalize(token, withCache))
          .filter(Boolean)

  const trimTokens = trim(tokens)

  if (!this.allowDuplicates) {
    return Array.from(new Set(trimTokens))
  }

  return trimTokens
}

function createUnicodeTokenizer({
  language,
  segmenter,
  ...config
}: LocaleTokenizerConfig): DefaultTokenizer {
  const tokenizerConfig: DefaultTokenizer & { segmenter?: Intl.Segmenter } = {
    tokenize: tokenizeInternal,
    language,
    segmenter,
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

export function createKoreanTokenizer(config: UnicodeTokenizerConfig = {}): DefaultTokenizer {
  return createUnicodeTokenizer({ ...config, language: 'korean', segmenter: koreanSegmenter })
}

export function createPolishTokenizer(config: UnicodeTokenizerConfig = {}): DefaultTokenizer {
  return createUnicodeTokenizer({ ...config, language: 'polish' })
}

export function createVietnameseTokenizer(config: UnicodeTokenizerConfig = {}): DefaultTokenizer {
  return createUnicodeTokenizer({ ...config, language: 'vietnamese' })
}
