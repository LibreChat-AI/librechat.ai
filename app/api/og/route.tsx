import { ImageResponse } from 'next/og'

/**
 * On-demand Open Graph image generator. Renders a 1200x630 branded social card
 * with the page title and section, so every shared link gets a unique preview.
 * Called via lib/og.ts `ogImageUrl()` from page metadata; CDN-cached by URL.
 */
export const runtime = 'nodejs'

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
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(circle at 18% 0%, rgba(99,102,241,0.22), transparent 45%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.16), transparent 45%)',
        color: '#fafafa',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
            fontSize: '40px',
          }}
        >
          🪶
        </div>
        <div style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.02em' }}>LibreChat</div>
      </div>

      {/* Title */}
      <div
        style={{
          display: 'flex',
          fontSize,
          fontWeight: 700,
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
          color: '#a1a1aa',
        }}
      >
        <div
          style={{
            display: 'flex',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div style={{ display: 'flex' }}>www.librechat.ai</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
