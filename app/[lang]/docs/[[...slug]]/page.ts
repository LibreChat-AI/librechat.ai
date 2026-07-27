import { generateDocsMetadata, generateLocalizedDocsParams, renderDocsPage } from '@/lib/docs-page'

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>
}

export default async function Page({ params }: PageProps) {
  return renderDocsPage(await params)
}

export function generateStaticParams() {
  return generateLocalizedDocsParams()
}

export async function generateMetadata({ params }: PageProps) {
  return generateDocsMetadata(await params)
}
