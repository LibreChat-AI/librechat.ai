import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { ReactNode } from 'react'

export default function AuthorsLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions} i18n={false}>
      {children}
    </HomeLayout>
  )
}
