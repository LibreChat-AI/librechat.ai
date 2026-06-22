import type { Metadata } from 'next'
import { HomePageContent } from '@/components/home/HomePageContent'
import { i18n } from '@/lib/i18n'
import { getUI } from '@/lib/ui-i18n'

const ui = getUI(i18n.defaultLanguage)

export const metadata: Metadata = {
  title: ui.home.metaTitle,
  description: ui.home.metaDescription,
  alternates: {
    canonical: '/',
    languages: Object.fromEntries(
      i18n.languages.map((locale) => [
        locale,
        locale === i18n.defaultLanguage ? '/' : `/${locale}`,
      ]),
    ),
  },
}

export default function HomePage() {
  return <HomePageContent lang={i18n.defaultLanguage} />
}
