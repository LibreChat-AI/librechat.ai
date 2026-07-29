import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Banner } from 'fumadocs-ui/components/banner'
import { Provider } from '@/components/provider'
import { AskAILoader } from '@/components/ai/AskAILoader'
import { CoreWebVitalsMonitor } from '@/components/analytics/CoreWebVitalsMonitor'
import { ogImageUrl } from '@/lib/og'
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
    images: [ogImageUrl()],
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
  // Sanitize the Reo.dev client ID: only allow alphanumeric chars, underscores,
  // and hyphens to prevent XSS via dangerouslySetInnerHTML injection if the env
  // var is compromised. Unset, which is the default, emits no script at all.
  const rawReoClientId = process.env.NEXT_PUBLIC_REO_CLIENT_ID ?? ''
  const reoClientId = /^[\w-]+$/.test(rawReoClientId) ? rawReoClientId : ''
  const askAIEnabled = Boolean(process.env.OPENROUTER_API_KEY)
  const plausibleEnabled = process.env.NODE_ENV === 'production'

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
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {/* Site announcement / release notice. Update the id when the message
            changes so previously-dismissed visitors see the new banner. */}
        <Banner id="clickhouse-agentic-data-stack" className="text-sm font-medium">
          LibreChat is joining ClickHouse to power the open-source Agentic Data Stack 🎉{' '}
          <a
            href="https://clickhouse.com/blog/librechat-open-source-agentic-data-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="ms-1 font-semibold underline underline-offset-2"
          >
            Learn more
          </a>
        </Banner>
        <Provider>{children}</Provider>
        {askAIEnabled && <AskAILoader />}
        {plausibleEnabled && (
          <>
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
              src="/js/pa-AxQn4zbc0KTWDDkxjlFGs.js"
              data-api="/api/e"
              strategy="afterInteractive"
            />
          </>
        )}
        {cwvEnabled && (
          <CoreWebVitalsMonitor
            projectId={cwvProjectId}
            endpoint={cwvEndpoint}
            sampleRate={cwvSampleRate}
          />
        )}
        {/* Developer-intent analytics by Reo.dev, replacing the retired Scarf
            pixel. Reo's loader appends its own tag and calls Reo.init() from the
            onload handler, so the snippet stays inline instead of moving to
            next/script's src + onLoad, which would turn this server component
            into a client one. No manual re-ping on navigation, unlike the Scarf
            pixel: that was a single image request, while reo.js instruments
            history itself. Reo does set first-party cookies, which /privacy and
            /cookie do not yet describe — see the PR for the follow-up. */}
        {reoClientId && (
          <Script
            id="reo-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              (function () {
                var CLIENT_ID = '${reoClientId}';
                var script = document.createElement('script');
                script.src = 'https://static.reo.dev/' + CLIENT_ID + '/reo.js';
                script.defer = true;
                script.onload = function () {
                  if (window.Reo && typeof window.Reo.init === 'function') {
                    window.Reo.init({ clientID: CLIENT_ID });
                  }
                };
                document.head.appendChild(script);
              })();
            `,
            }}
          />
        )}
      </body>
    </html>
  )
}
