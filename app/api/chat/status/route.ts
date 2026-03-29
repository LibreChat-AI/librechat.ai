import { NextResponse } from 'next/server'

/** Env vars don't change at runtime — cache aggressively. */
export const revalidate = 3600

/** Returns whether the AI chat service is configured. */
export function GET() {
  const configured = Boolean(process.env.OPENROUTER_API_KEY)
  return NextResponse.json(
    { configured },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
