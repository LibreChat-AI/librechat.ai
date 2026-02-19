import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'
import CredsGeneratorClient from './client'

export const metadata: Metadata = {
  title: 'Credentials Generator',
  description: 'Generate secure credentials for your LibreChat configuration',
}

export default function CredsGeneratorPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="mx-auto max-w-5xl px-4 py-16">
        <CredsGeneratorClient />
      </main>
    </HomeLayout>
  )
}
