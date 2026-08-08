import { create, type AnyOrama } from '@orama/orama'
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static'
import { SEARCH_LANGUAGE_BY_LOCALE } from '@/lib/search-languages'

/**
 * Build the same locale-specific tokenizer used by the static search route.
 * Search queries and the generated index must use matching tokenizers.
 */
export async function initOrama(locale?: string): Promise<AnyOrama> {
  if (locale === 'zh') {
    const { createTokenizer } = await import('@orama/tokenizers/mandarin')
    return create({ schema: { _: 'string' }, components: { tokenizer: createTokenizer() } })
  }
  if (locale === 'ja') {
    const { createTokenizer } = await import('@orama/tokenizers/japanese')
    return create({ schema: { _: 'string' }, components: { tokenizer: createTokenizer() } })
  }
  if (locale === 'ko') {
    const { createKoreanTokenizer } = await import('@/lib/unicode-tokenizer')
    return create({ schema: { _: 'string' }, components: { tokenizer: createKoreanTokenizer() } })
  }
  if (locale === 'pl') {
    const { createPolishTokenizer } = await import('@/lib/unicode-tokenizer')
    return create({ schema: { _: 'string' }, components: { tokenizer: createPolishTokenizer() } })
  }
  if (locale === 'vi') {
    const { createVietnameseTokenizer } = await import('@/lib/unicode-tokenizer')
    return create({
      schema: { _: 'string' },
      components: { tokenizer: createVietnameseTokenizer() },
    })
  }

  return create({
    schema: { _: 'string' },
    language: SEARCH_LANGUAGE_BY_LOCALE[locale ?? 'en'] ?? 'english',
  })
}

export function createDocsSearchClient(locale: string) {
  return oramaStaticClient({
    from: `/api/search/${encodeURIComponent(locale)}`,
    initOrama,
    locale,
  })
}
