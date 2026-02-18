import '../style.css'
import '../src/overrides.css'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Hubspot, hsPageView } from '@/components/analytics/hubspot'
import { CrispWidget } from '@/components/supportChat'
import { Banner } from '@/components/Banner'
import type { AppProps } from 'next/app'
import type PostHogType from 'posthog-js'
type PostHog = typeof PostHogType

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const posthogRef = useRef<PostHog | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import('posthog-js').then(({ default: ph }) => {
        ph.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') posthog.debug()
          },
        })
        posthogRef.current = ph
      })
    }
  }, [])

  useEffect(() => {
    const handleRouteChange = (path: string) => {
      posthogRef.current?.capture('$pageview')
      hsPageView(path)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return (
    <div className={`${GeistSans.variable} font-sans ${GeistMono.variable} font-mono`}>
      <Banner storageKey="clickhouse-announcement" />
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
      {process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ? <CrispWidget /> : null}
      <Hubspot />
    </div>
  )
}
