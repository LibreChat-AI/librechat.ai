import { docsSource } from '@/lib/source'
import { getLLMText, MARKDOWN_RESPONSE_HEADERS } from '@/lib/get-llm-text'

export const revalidate = false

export async function GET() {
  const scan = docsSource.getPages().map(getLLMText)
  const scanned = await Promise.all(scan)

  return new Response(scanned.join('\n\n'), {
    headers: MARKDOWN_RESPONSE_HEADERS,
  })
}
