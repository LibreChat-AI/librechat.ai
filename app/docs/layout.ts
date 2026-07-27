import { i18n } from '@/lib/i18n'
import { renderDocsLayout } from '@/lib/docs-layout'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return renderDocsLayout({ lang: i18n.defaultLanguage, children })
}
