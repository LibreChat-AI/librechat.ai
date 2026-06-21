import { getOrderedDocsPages, getLLMText, MARKDOWN_RESPONSE_HEADERS } from '@/lib/get-llm-text'

export const revalidate = false

const HEADER = `# LibreChat Documentation

> Full text of the LibreChat documentation for language models and coding agents. Pages follow the docs navigation order: start with deployment and configuration, then features and tools, and finish with the contributing guides.`

export async function GET() {
  const pages = getOrderedDocsPages()
  const scanned = await Promise.all(pages.map(getLLMText))

  return new Response([HEADER, ...scanned].join('\n\n'), {
    headers: MARKDOWN_RESPONSE_HEADERS,
  })
}
