const REPO = 'danny-avila/LibreChat'

function githubHeaders(): HeadersInit {
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  }
}

export async function getGitHubData(): Promise<{
  stars: number
  forks: number
  contributors: number
}> {
  try {
    const [repoRes, contribRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${REPO}`, {
        headers: githubHeaders(),
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=1&anon=true`, {
        headers: githubHeaders(),
        next: { revalidate: 3600 },
      }),
    ])

    const repoData = repoRes.ok ? await repoRes.json() : {}
    const stars = repoData.stargazers_count ?? 0
    const forks = repoData.forks_count ?? 0

    let contributors = 0
    if (contribRes.ok) {
      const linkHeader = contribRes.headers.get('link')
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/)
        contributors = match ? parseInt(match[1], 10) : 0
      }
    }

    return { stars, forks, contributors }
  } catch (error) {
    console.error('[GitHub] API fetch failed:', error instanceof Error ? error.message : error)
    return { stars: 0, forks: 0, contributors: 0 }
  }
}
