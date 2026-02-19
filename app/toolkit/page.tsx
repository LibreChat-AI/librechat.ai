import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ToolKit',
  description: 'LibreChat development tools and utilities',
}

export default function ToolkitPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-8 text-3xl font-bold">ToolKit</h1>
        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Credentials Generator</h2>
          <p className="mb-4 text-sm text-fd-muted-foreground">
            Generate secure credentials for your LibreChat configuration.
          </p>
          <Link
            href="/toolkit/creds-generator"
            className="inline-block rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground hover:opacity-90"
          >
            Credentials Generator
          </Link>
        </section>
        <section>
          <h2 className="mb-2 text-xl font-semibold">YAML Validator (beta)</h2>
          <p className="mb-4 text-sm text-fd-muted-foreground">
            Validate your LibreChat YAML configuration files.
          </p>
          <Link
            href="/toolkit/yaml-checker"
            className="inline-block rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground hover:opacity-90"
          >
            YAML Validator
          </Link>
        </section>
      </main>
    </HomeLayout>
  )
}
