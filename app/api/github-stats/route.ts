import { NextResponse } from 'next/server'
import { getGitHubData } from '@/lib/github'

export const revalidate = 3600

export async function GET() {
  try {
    const { stars, forks } = await getGitHubData()
    return NextResponse.json(
      { stars, forks },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' } },
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
