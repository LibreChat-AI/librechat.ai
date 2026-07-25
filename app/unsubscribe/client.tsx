'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const UnsubscribeForm = dynamic(() => import('@/components/Newsletter/UnsubscribeForm'), {
  ssr: false,
})

export default function UnsubscribeClient() {
  const [credentials, setCredentials] = useState<{ email?: string; token?: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    setCredentials({
      email: params.get('email') ?? undefined,
      token: params.get('token') ?? undefined,
    })
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }, [])

  if (!credentials) return null
  return <UnsubscribeForm email={credentials.email} token={credentials.token} />
}
