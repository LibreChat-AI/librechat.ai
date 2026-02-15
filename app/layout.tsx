import { Provider } from '@/components/provider'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
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
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider>{children}</Provider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
