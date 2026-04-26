import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { CWVMonitor } from 'next-cwv-monitor/app-router'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Provider } from '@/components/provider'
import { AskAILoader } from '@/components/ai/AskAILoader'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'LibreChat',
    template: '%s | LibreChat',
  },
  description: 'The Open-Source AI Platform',
  metadataBase: new URL('https://www.librechat.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'LibreChat',
    images: ['/images/socialcards/default-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Sanitize Scarf pixel ID: only allow alphanumeric chars, underscores, and hyphens
  // to prevent XSS via dangerouslySetInnerHTML injection if the env var is compromised.
  const rawScarfId = process.env.NEXT_PUBLIC_SCARF_PIXEL_ID ?? ''
  const scarfPixelId = /^[\w-]+$/.test(rawScarfId) ? rawScarfId : ''

  const cwvProjectId = process.env.NEXT_PUBLIC_CWV_PROJECT_ID ?? ''
  const cwvEndpointRaw = process.env.NEXT_PUBLIC_CWV_ENDPOINT ?? ''
  const cwvEndpoint = (() => {
    if (!cwvEndpointRaw) return ''
    try {
      const u = new URL(cwvEndpointRaw)
      return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : ''
    } catch {
      return ''
    }
  })()
  const cwvEnabled = /^[\w-]+$/.test(cwvProjectId) && cwvEndpoint !== ''
  const cwvSampleRateRaw = Number(process.env.NEXT_PUBLIC_CWV_SAMPLE_RATE)
  const cwvSampleRate =
    Number.isFinite(cwvSampleRateRaw) && cwvSampleRateRaw >= 0 && cwvSampleRateRaw <= 1
      ? cwvSampleRateRaw
      : 1

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        <AskAILoader />
        <Script
          defer
          data-domain="librechat.ai"
          src="https://analytics.librechat.ai/js/script.outbound-links.tagged-events.hash.js"
          strategy="afterInteractive"
        />
        {cwvEnabled && (
          <CWVMonitor projectId={cwvProjectId} endpoint={cwvEndpoint} sampleRate={cwvSampleRate} />
        )}
        {scarfPixelId && (
          <Script
            id="scarf-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              (function () {
                var PIXEL_ID = '${scarfPixelId}';
                function sendScarfPing() {
                  var img = new Image();
                  img.referrerPolicy = 'no-referrer-when-downgrade';
                  img.src = 'https://static.scarf.sh/a.png?x-pxid=' + PIXEL_ID;
                }
                var originalPushState = history.pushState;
                history.pushState = function () {
                  originalPushState.apply(this, arguments);
                  window.dispatchEvent(new Event('scarf:locationchange'));
                };
                window.addEventListener('hashchange', sendScarfPing);
                window.addEventListener('popstate', sendScarfPing);
                window.addEventListener('scarf:locationchange', sendScarfPing);
                sendScarfPing();
              })();
            `,
            }}
          />
        )}
      </body>
    </html>
  )
}
