import '../style.css'
import 'vidstack/styles/base.css'
import '../src/overrides.css'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { PostHogProvider } from 'posthog-js/react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Hubspot, hsPageView } from '@/components/analytics/hubspot'
import { CrispWidget } from '@/components/supportChat'
import { Banner } from '@/components/Banner'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        // Enable debug mode in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
      })
    }
    // Track page views
    const handleRouteChange = (path: string) => {
      posthog.capture('$pageview')
      hsPageView(path)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])
  return (
    <div className={`${GeistSans.variable} font-sans ${GeistMono.variable} font-mono`}>
      <PostHogProvider client={posthog}>
        <Banner storageKey="clickhouse-announcement" />
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ? <CrispWidget /> : null}
      </PostHogProvider>
      <Hubspot />
    </div>
  )
}
