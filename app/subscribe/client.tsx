'use client'

import dynamic from 'next/dynamic'

const SubscribeForm = dynamic(() => import('@/components/Newsletter/SubscribeForm'), { ssr: false })

export default function SubscribeClient() {
  return <SubscribeForm />
}
