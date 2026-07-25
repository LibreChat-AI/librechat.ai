import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'
import UnsubscribeClient from './client'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Unsubscribe from the LibreChat newsletter',
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; token?: string | string[] }>
}) {
  const { email, token } = await searchParams

  return (
    <HomeLayout {...baseOptions}>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-xl px-4 py-16">
        <UnsubscribeClient
          email={typeof email === 'string' ? email : undefined}
          token={typeof token === 'string' ? token : undefined}
        />
      </main>
    </HomeLayout>
  )
}
