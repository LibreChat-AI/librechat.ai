import type { Metadata } from 'next'
import { HomePageContent } from '@/components/home/HomePageContent'
import { i18n, localizedHomeAlternates } from '@/lib/i18n'
import { getUI } from '@/lib/ui-i18n'

const ui = getUI(i18n.defaultLanguage)

export const metadata: Metadata = {
  title: ui.home.metaTitle,
  description: ui.home.metaDescription,
  alternates: {
    canonical: '/',
    languages: localizedHomeAlternates(),
  },
}

export default function HomePage() {
  return <HomePageContent lang={i18n.defaultLanguage} />
}
