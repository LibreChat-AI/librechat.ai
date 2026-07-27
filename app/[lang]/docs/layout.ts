import { renderDocsLayout } from '@/lib/docs-layout'
import type { ReactNode } from 'react'

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>
  children: ReactNode
}) {
  const { lang } = await params
  return renderDocsLayout({ lang, children })
}
