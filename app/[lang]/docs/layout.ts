import { isArchivedVersion } from '@/lib/docs-archive'
import { renderDocsLayout } from '@/lib/docs-layout'
import { i18n } from '@/lib/i18n'
import type { ReactNode } from 'react'

/**
 * The `[lang]` segment carries either a locale (`/es/docs/...`) or an archived
 * docs version (`/v0.7.x/docs/...`) — Next.js can't give `/docs/[[...slug]]` a
 * dynamic sibling segment, so the version shares the locale slot.
 */
export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>
  children: ReactNode
}) {
  const { lang } = await params

  if (isArchivedVersion(lang)) {
    return renderDocsLayout({ lang: i18n.defaultLanguage, children, archivedVersion: lang })
  }

  return renderDocsLayout({ lang, children })
}
