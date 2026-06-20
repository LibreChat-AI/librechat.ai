import { docsSource } from '@/lib/source'
import { getLLMText, MARKDOWN_RESPONSE_HEADERS } from '@/lib/get-llm-text'
import { i18n } from '@/lib/i18n'

export const revalidate = false

export async function GET() {
  // getPages() already defaults to the default language, but pass it explicitly
  // so generated *.<locale>.mdx pages can never leak into the English export.
  const scan = docsSource.getPages(i18n.defaultLanguage).map(getLLMText)
  const scanned = await Promise.all(scan)

  return new Response(scanned.join('\n\n'), {
    headers: MARKDOWN_RESPONSE_HEADERS,
  })
}
