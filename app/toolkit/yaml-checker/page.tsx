import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'
import YamlCheckerClient from './client'

export const metadata: Metadata = {
  title: 'YAML Validator',
  description: 'Validate your LibreChat YAML configuration files',
}

export default function YamlCheckerPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="mx-auto max-w-5xl px-4 py-16">
        <YamlCheckerClient />
      </main>
    </HomeLayout>
  )
}
