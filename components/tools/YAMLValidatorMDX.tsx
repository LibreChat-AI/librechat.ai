'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { i18n } from '@/lib/i18n'

const YAMLValidator = dynamic<{ lang?: string }>(() => import('@/components/tools/yamlChecker'), {
  ssr: false,
  loading: () => <div className="h-[500px] animate-pulse rounded-lg bg-fd-muted" />,
})

function useResolvedLocale(lang?: string): string {
  const pathname = usePathname() ?? '/'
  if (lang && i18n.languages.includes(lang)) return lang

  const [firstSegment] = pathname.split('/').filter(Boolean)
  return i18n.languages.includes(firstSegment) ? firstSegment : i18n.defaultLanguage
}

export function YAMLValidatorMDX({ lang }: { lang?: string }) {
  const locale = useResolvedLocale(lang)
  return <YAMLValidator lang={locale} />
}
