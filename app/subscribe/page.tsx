import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'
import SubscribeClient from './client'

export const metadata: Metadata = {
  title: 'Subscribe',
  description: 'Subscribe to the LibreChat newsletter',
}

export default function SubscribePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="mx-auto max-w-xl px-4 py-16">
        <SubscribeClient />
      </main>
    </HomeLayout>
  )
}
