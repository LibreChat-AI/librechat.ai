import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * On-demand Open Graph image generator. Renders a 1200x630 branded social card
 * with the page title and section, so every shared link gets a unique preview.
 * Called via lib/og.ts `ogImageUrl()` from page metadata; CDN-cached by URL.
 *
 * Brand assets (Geist fonts + the LibreChat logo) are read from disk once at
 * module load — no network fetch at render time, so cold starts can't fail.
 * Colors mirror the neutral shadcn theme tokens in app/global.css (.dark).
 */
export const runtime = 'nodejs'

const FONTS_DIR = join(process.cwd(), 'lib/fonts')
const geistRegular = readFileSync(join(FONTS_DIR, 'Geist-Regular.ttf'))
const geistSemiBold = readFileSync(join(FONTS_DIR, 'Geist-SemiBold.ttf'))
const logoSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public/librechat.png'),
).toString('base64')}`

// app/global.css .dark tokens (hsl 0 0% L → hex), the site's neutral palette.
const BACKGROUND = '#0a0a0a' // --background
const FOREGROUND = '#fafafa' // --foreground
const MUTED_FOREGROUND = '#8c8c8c' // --muted-foreground

const TYPE_LABELS: Record<string, string> = {
  docs: 'Documentation',
  blog: 'Blog',
  changelog: 'Changelog',
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawTitle = searchParams.get('title')?.trim()
  const title = (rawTitle && rawTitle.length > 0 ? rawTitle : 'The Open-Source AI Platform').slice(
    0,
    110,
  )
  const type = searchParams.get('type') ?? ''
  const label = TYPE_LABELS[type] ?? 'librechat.ai'
  // Scale the title down for longer headlines so they stay on the card.
  const fontSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 80

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        backgroundColor: BACKGROUND,
        color: FOREGROUND,
        fontFamily: 'Geist',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={64} height={64} alt="" />
        <div style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.02em' }}>LibreChat</div>
      </div>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontSize,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          maxWidth: '1000px',
        }}
      >
        {title}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '26px',
          color: MUTED_FOREGROUND,
        }}
      >
        <div
          style={{
            display: 'flex',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 400,
          }}
        >
          {label}
        </div>
        <div style={{ display: 'flex' }}>www.librechat.ai</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Geist', data: geistRegular, weight: 400, style: 'normal' },
        { name: 'Geist', data: geistSemiBold, weight: 600, style: 'normal' },
      ],
      // Cards are content-addressed: callers append a `?v=` fingerprint
      // (lib/og.ts) that changes whenever the art changes, so a given URL's
      // bytes never change. Cache them hard at every layer.
      //
      // NB Cloudflare: for this to hold at the edge, the zone must respect
      // origin cache headers for these responses (Cache Rule -> "Respect
      // origin" / Browser Cache TTL -> "Respect Existing Headers"). The legacy
      // unversioned /images/socialcards/*.png was served stale for ~15 days
      // because Cloudflare ignored its `max-age=0, must-revalidate` and applied
      // its own long edge TTL. Versioned URLs sidestep that, but the zone
      // setting should still respect origin so unversioned assets revalidate.
      headers: {
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
    },
  )
}
