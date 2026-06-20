import { getLLMText } from '@/lib/get-llm-text'
import { docsSource } from '@/lib/source'
import { i18n } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export const revalidate = false

export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = docsSource.getPage(slug, i18n.defaultLanguage)
  if (!page) notFound()

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  })
}

export function generateStaticParams() {
  // This route serves the English raw markdown; keep one entry per slug.
  return docsSource
    .generateParams()
    .filter((p) => p.lang === i18n.defaultLanguage)
    .map(({ slug }) => ({ slug }))
}
