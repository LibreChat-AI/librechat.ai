'use server'

interface FeedbackPayload {
  opinion: 'good' | 'bad'
  message: string
  url: string
}

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const MAX_MESSAGE_LENGTH = 2000
const VALID_OPINIONS = new Set(['good', 'bad'])

import { createRateLimiter } from '@/lib/rate-limit'

const isRateLimited = createRateLimiter(3, 60_000)

/**
 * Validate and sanitize the feedback payload.
 * Returns null if invalid, or the sanitized payload.
 */
function validatePayload(
  raw: unknown,
): { opinion: 'good' | 'bad'; message: string; url: string } | null {
  if (!raw || typeof raw !== 'object') return null

  const { opinion, message, url } = raw as Record<string, unknown>

  // Opinion must be exactly 'good' or 'bad'
  if (typeof opinion !== 'string' || !VALID_OPINIONS.has(opinion)) return null

  // URL must be a relative docs path (no external URLs / open redirect)
  if (typeof url !== 'string' || !url.startsWith('/') || url.includes('//')) return null

  // Message is optional but must be a string with bounded length
  const safeMessage = typeof message === 'string' ? message.slice(0, MAX_MESSAGE_LENGTH).trim() : ''

  return {
    opinion: opinion as 'good' | 'bad',
    message: safeMessage,
    url: url.slice(0, 500),
  }
}

async function createGitHubDiscussion(payload: FeedbackPayload): Promise<void> {
  const token = process.env.GITHUB_FEEDBACK_TOKEN
  const categoryId = process.env.GITHUB_DISCUSSION_CATEGORY_ID
  const repoId = process.env.GITHUB_DISCUSSION_REPO_ID

  if (!token || !categoryId || !repoId) return

  const emoji = payload.opinion === 'good' ? '👍' : '👎'
  const title = `${emoji} Feedback on ${payload.url}`
  const body = [
    `**Page:** ${payload.url}`,
    `**Rating:** ${payload.opinion}`,
    payload.message ? `**Message:**\n${payload.message}` : '',
    `---`,
    `*Submitted via docs feedback widget*`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const query = `
    mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: {
        repositoryId: $repoId,
        categoryId: $categoryId,
        title: $title,
        body: $body
      }) {
        discussion { url }
      }
    }
  `

  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { repoId, categoryId, title, body },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[Feedback] GitHub Discussion creation failed:', res.status, text)
  }
}

async function postToDiscord(payload: FeedbackPayload): Promise<void> {
  const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK
  if (!webhookUrl) return

  const emoji = payload.opinion === 'good' ? ':thumbsup:' : ':thumbsdown:'
  const embed = {
    title: `${emoji} Docs Feedback`,
    color: payload.opinion === 'good' ? 0x22c55e : 0xef4444,
    fields: [
      { name: 'Page', value: payload.url, inline: true },
      { name: 'Rating', value: payload.opinion, inline: true },
      ...(payload.message ? [{ name: 'Message', value: payload.message }] : []),
    ],
    timestamp: new Date().toISOString(),
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('[Feedback] Discord webhook failed:', res.status, text)
  }
}

export async function submitFeedback(raw: FeedbackPayload): Promise<{ success: boolean }> {
  try {
    // Validate before rate limiting to avoid polluting the rate limit map with junk keys
    const payload = validatePayload(raw)
    if (!payload) {
      return { success: false }
    }

    // Rate limit by validated URL to prevent spamming the same page
    if (isRateLimited(payload.url)) {
      return { success: false }
    }

    await Promise.allSettled([createGitHubDiscussion(payload), postToDiscord(payload)])
    return { success: true }
  } catch (err) {
    console.error('[Feedback] Unexpected error:', err)
    return { success: false }
  }
}
