import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePageContent } from '@/components/home/HomePageContent'
import { i18n } from '@/lib/i18n'
import { getUI } from '@/lib/ui-i18n'

interface PageProps {
  params: Promise<{ lang: string }>
}

// Only the non-default locales have a prefixed landing page; English lives at
// `/`. Anything else (or `/en`) 404s.
export function generateStaticParams() {
  return i18n.languages.filter((lang) => lang !== i18n.defaultLanguage).map((lang) => ({ lang }))
}

export const dynamicParams = false

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params
  const t = getUI(lang).home
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        i18n.languages.map((locale) => [
          locale,
          locale === i18n.defaultLanguage ? '/' : `/${locale}`,
        ]),
      ),
    },
  }
}

export default async function LocalizedHomePage(props: PageProps) {
  const { lang } = await props.params
  if (lang === i18n.defaultLanguage || !i18n.languages.includes(lang)) notFound()
  return <HomePageContent lang={lang} />
}
