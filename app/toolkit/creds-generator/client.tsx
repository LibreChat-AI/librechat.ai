'use client'

import dynamic from 'next/dynamic'

const CredsGenerator = dynamic(() => import('@/components/tools/CredentialsGeneratorBox'), {
  ssr: false,
})

export default function CredsGeneratorClient() {
  return <CredsGenerator />
}
