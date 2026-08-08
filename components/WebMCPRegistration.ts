'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createWebMCPTools, registerWebMCPTools } from '@/lib/webmcp'

/** Register the site's public browser tools for the lifetime of this app shell. */
export function WebMCPRegistration() {
  const router = useRouter()

  useEffect(() => {
    const controller = new AbortController()
    const tools = createWebMCPTools({
      navigate: (path) => router.push(path),
      getCurrentUrl: () => new URL(window.location.href),
      fetcher: (input, init) => window.fetch(input, init),
    })

    registerWebMCPTools(tools, controller.signal)

    return () => controller.abort()
  }, [router])

  return null
}
