'use client'

import dynamic from 'next/dynamic'

const UnsubscribeForm = dynamic(() => import('@/components/Newsletter/UnsubscribeForm'), {
  ssr: false,
})

export default function UnsubscribeClient() {
  return <UnsubscribeForm />
}
