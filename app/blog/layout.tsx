import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { ReactNode } from 'react'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions} i18n={false}>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl px-4 py-16">
        {children}
      </main>
    </HomeLayout>
  )
}
