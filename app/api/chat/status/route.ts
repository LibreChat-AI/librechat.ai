import { NextResponse } from 'next/server'

/** Returns whether the AI chat service is configured. */
export function GET() {
  const configured = Boolean(process.env.OPENROUTER_API_KEY)
  return NextResponse.json({ configured })
}
