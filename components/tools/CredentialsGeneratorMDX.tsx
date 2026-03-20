'use client'

import dynamic from 'next/dynamic'

const CredentialsGenerator = dynamic(() => import('@/components/tools/CredentialsGeneratorBox'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-fd-muted" />,
})

export function CredentialsGeneratorMDX() {
  return <CredentialsGenerator />
}
