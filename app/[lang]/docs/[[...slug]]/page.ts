import {
  generateArchivedDocsMetadata,
  generateArchivedDocsParams,
  generateDocsMetadata,
  generateLocalizedDocsParams,
  renderArchivedDocsPage,
  renderDocsPage,
} from '@/lib/docs-page'
import { isArchivedVersion } from '@/lib/docs-archive'

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>
}

export default async function Page({ params }: PageProps) {
  const { lang, slug } = await params

  if (isArchivedVersion(lang)) return renderArchivedDocsPage({ version: lang, slug })

  return renderDocsPage({ lang, slug })
}

export function generateStaticParams() {
  return [...generateLocalizedDocsParams(), ...generateArchivedDocsParams()]
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params

  if (isArchivedVersion(lang)) return generateArchivedDocsMetadata({ version: lang, slug })

  return generateDocsMetadata({ lang, slug })
}
