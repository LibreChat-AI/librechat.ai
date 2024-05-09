import '../style.css'
import 'vidstack/styles/base.css'
import '../src/overrides.css'
import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { CrispWidget } from '@/components/supportChat'
import { Hubspot, hsPageView } from '@/components/analytics/hubspot'
import { GeistSans } from 'geist/font/sans'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
// import { GeistMono } from "geist/font/mono";

export default function App({ Component, pageProps }) {
  const router = useRouter()
  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        // Enable debug mode in development
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') posthog.debug()
        },
      })
    }
    // Track page views
    const handleRouteChange = (path) => {
      posthog.capture('$pageview')
      hsPageView(path)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])
  return (
    // <div className={`${GeistSans.variable} font-sans ${GeistMono.variable}`}>
    <div className={`${GeistSans.variable}`}>
      <PostHogProvider client={posthog}>
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ? <CrispWidget /> : null}
      </PostHogProvider>
      <Hubspot />
      <Script
        src="https://app.termly.io/resource-blocker/26739b38-1a89-4742-ab53-d8d724b77f51?autoBlock=on"
        strategy="beforeInteractive"
        type="text/javascript"
      />
    </div>
  )
}
