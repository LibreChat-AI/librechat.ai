import { generateDocsMetadata, generateEnglishDocsParams, renderDocsPage } from '@/lib/docs-page'
import { i18n } from '@/lib/i18n'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return renderDocsPage({ lang: i18n.defaultLanguage, slug })
}

export function generateStaticParams() {
  return generateEnglishDocsParams()
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return generateDocsMetadata({ lang: i18n.defaultLanguage, slug })
}
