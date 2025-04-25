import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type GitHubResponse = {
  stargazers_count: number
}

type ResponseData = {
  stars: number
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    // GitHub API endpoint for the LibreChat repository
    const response = await axios.get<GitHubResponse>(
      'https://api.github.com/repos/danny-avila/LibreChat',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          // Use GitHub token if available in environment variables
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
      },
    )

    // Cache the response for 1 hour (3600 seconds)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')

    // Return the star count
    return res.status(200).json({ stars: response.data.stargazers_count })
  } catch (error) {
    console.error('Error fetching GitHub stats:', error)
    return res.status(500).json({ stars: 0, error: 'Failed to fetch GitHub stats' })
  }
}
