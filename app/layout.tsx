import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
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

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        <AskAILoader />
        <Analytics />
        <SpeedInsights />
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
