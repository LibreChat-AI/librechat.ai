import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const response = await fetch('https://api.github.com/repos/danny-avila/LibreChat', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub stats' },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.subscribers_count,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
