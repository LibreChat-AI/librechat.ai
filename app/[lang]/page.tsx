import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomePageContent } from '@/components/home/HomePageContent'
import { hasLocalizedHome, i18n, LOCALIZED_HOME_LOCALES, localizedHomeAlternates } from '@/lib/i18n'
import { getUI } from '@/lib/ui-i18n'

interface PageProps {
  params: Promise<{ lang: string }>
}

// Only the non-default locales have a prefixed landing page; English lives at
// `/`. Anything else (or `/en`) 404s.
export function generateStaticParams() {
  return LOCALIZED_HOME_LOCALES.filter((lang) => lang !== i18n.defaultLanguage).map((lang) => ({
    lang,
  }))
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
      languages: localizedHomeAlternates(),
    },
  }
}

export default async function LocalizedHomePage(props: PageProps) {
  const { lang } = await props.params
  if (lang === i18n.defaultLanguage || !hasLocalizedHome(lang)) notFound()
  return <HomePageContent lang={lang} />
}
