import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'
import UnsubscribeClient from './client'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Unsubscribe from the LibreChat newsletter',
}

export default function UnsubscribePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="mx-auto max-w-xl px-4 py-16">
        <UnsubscribeClient />
      </main>
    </HomeLayout>
  )
}
