import { docsSource } from '@/lib/source'
import { getLLMText } from '@/lib/get-llm-text'

export const revalidate = false

export async function GET() {
  const scan = docsSource.getPages().map(getLLMText)
  const scanned = await Promise.all(scan)

  return new Response(scanned.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
