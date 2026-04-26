import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Provider } from '@/components/provider'
import { AskAILoader } from '@/components/ai/AskAILoader'
import { CoreWebVitalsMonitor } from '@/components/analytics/CoreWebVitalsMonitor'
import './global.css'

const DEFAULT_CWV_ENDPOINT = ''
const DEFAULT_CWV_PROJECT_ID = '64ddab45-756f-474b-a8c9-266d264c93d8'
const DEFAULT_CWV_SAMPLE_RATE = 0.5

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

function normalizeCwvEndpoint(endpoint: string) {
  const trimmedEndpoint = endpoint.trim()
  if (!trimmedEndpoint) return ''

  const endpointUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedEndpoint)
    ? trimmedEndpoint
    : `https://${trimmedEndpoint}`

  try {
    const url = new URL(endpointUrl)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : ''
  } catch {
    return ''
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Sanitize Scarf pixel ID: only allow alphanumeric chars, underscores, and hyphens
  // to prevent XSS via dangerouslySetInnerHTML injection if the env var is compromised.
  const rawScarfId = process.env.NEXT_PUBLIC_SCARF_PIXEL_ID ?? ''
  const scarfPixelId = /^[\w-]+$/.test(rawScarfId) ? rawScarfId : ''
  const askAIEnabled = Boolean(process.env.OPENROUTER_API_KEY)

  const cwvProjectId = process.env.NEXT_PUBLIC_CWV_PROJECT_ID?.trim() || DEFAULT_CWV_PROJECT_ID
  const cwvEndpoint = normalizeCwvEndpoint(
    process.env.NEXT_PUBLIC_CWV_ENDPOINT || DEFAULT_CWV_ENDPOINT,
  )
  const cwvEnabled = /^[\w-]+$/.test(cwvProjectId) && cwvEndpoint !== ''
  const cwvSampleRateRaw = Number(process.env.NEXT_PUBLIC_CWV_SAMPLE_RATE)
  const cwvSampleRate =
    Number.isFinite(cwvSampleRateRaw) && cwvSampleRateRaw >= 0 && cwvSampleRateRaw <= 1
      ? cwvSampleRateRaw
      : DEFAULT_CWV_SAMPLE_RATE

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        {askAIEnabled && <AskAILoader />}
        {/* Privacy-friendly analytics by Plausible */}
        <Script
          id="plausible-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
              plausible.init()
            `,
          }}
        />
        <Script
          async
          id="plausible-script"
          src="https://plausible.librechat.ai/js/pa-AxQn4zbc0KTWDDkxjlFGs.js"
          strategy="afterInteractive"
        />
        {cwvEnabled && (
          <CoreWebVitalsMonitor
            projectId={cwvProjectId}
            endpoint={cwvEndpoint}
            sampleRate={cwvSampleRate}
          />
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
