import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai'
import { z } from 'zod'
import { docsSource } from '@/lib/source'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

interface SearchDoc {
  url: string
  title: string
  description: string
  content: string
}

let searchIndex: SearchDoc[] | null = null

async function getSearchIndex(): Promise<SearchDoc[]> {
  if (searchIndex) return searchIndex

  const pages = docsSource.getPages()
  const docs: SearchDoc[] = []

  for (const page of pages) {
    try {
      const filePath = join(process.cwd(), 'content/docs', page.file.path)
      const raw = await readFile(filePath, 'utf-8')
      const content = raw.replace(/^---[\s\S]*?---\n*/, '')

      docs.push({
        url: page.url,
        title: page.data.title,
        description: page.data.description ?? '',
        content: content.slice(0, 3000),
      })
    } catch {
      // Skip pages that can't be read
    }
  }

  searchIndex = docs
  return docs
}

/** Get a single page's full content for "this page" mode */
async function getPageContent(url: string): Promise<string | null> {
  try {
    const page = docsSource.getPages().find((p) => p.url === url)
    if (!page) return null

    const filePath = join(process.cwd(), 'content/docs', page.file.path)
    const raw = await readFile(filePath, 'utf-8')
    return raw.replace(/^---[\s\S]*?---\n*/, '').slice(0, 8000)
  } catch {
    return null
  }
}

function searchDocs(docs: SearchDoc[], query: string, limit: number): SearchDoc[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  return docs
    .map((doc) => {
      const text = `${doc.title} ${doc.description} ${doc.content}`.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (doc.title.toLowerCase().includes(term)) score += 10
        if (doc.description.toLowerCase().includes(term)) score += 5
        if (text.includes(term)) score += 1
      }
      return { doc, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.doc)
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const systemPrompt = `You are the LibreChat docs assistant. You help users find answers in the LibreChat documentation.

Rules:
- ALWAYS use the \`search\` tool first before answering. Do not guess.
- Be concise: 2-4 sentences max, then link to the relevant page.
- Respond in the same language the user writes in.
- Format answers in markdown. Use \`inline code\` for config keys, commands, filenames.
- When referencing a doc page, link to it as: [Page Title](/docs/path) — always use the url from search results.
- If a search result has a specific section heading relevant to the question, link to the anchor: [Section Name](/docs/path#section-name) where section-name is the heading lowercased with spaces replaced by hyphens.
- If you cannot find the answer, say so honestly and suggest the user check the docs or ask on Discord.
- Never invent features, config options, or CLI flags that don't appear in search results.
- Prefer showing the exact config snippet or command over explaining it in prose.
- When showing code blocks, specify the language (yaml, bash, env, etc).
- If the user's question clearly maps to a single doc page (e.g. "take me to the Docker guide", "show me the Azure config", "where is the MCP docs?"), use the \`navigate\` tool to redirect them directly to that page. Only do this when the intent is clearly navigation, not when they're asking a question about the content.`

const thisPagePrompt = `You are the LibreChat docs assistant. The user is asking about a specific docs page whose content is provided below. Answer ONLY from this page content — do not use the search tool.

Rules:
- Be concise: 2-4 sentences max.
- Respond in the same language the user writes in.
- Format answers in markdown. Use \`inline code\` for config keys, commands, filenames.
- If the answer is not on this page, say so and suggest they ask in the general mode.
- Prefer showing the exact config snippet or command over explaining it in prose.
- When showing code blocks, specify the language (yaml, bash, env, etc).`

const searchTool = tool({
  description: 'Search the LibreChat documentation and return relevant pages.',
  inputSchema: z.object({
    query: z.string().describe('Search query'),
    limit: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ query, limit }: { query: string; limit: number }) => {
    const docs = await getSearchIndex()
    const results = searchDocs(docs, query, limit)
    return results.map((r) => ({
      title: r.title,
      url: r.url,
      description: r.description,
      content: r.content.slice(0, 1500),
    }))
  },
})

const navigateTool = tool({
  description:
    'Navigate the user directly to a specific documentation page. Use this when the user clearly wants to go to a page, not when they are asking a question about the content. Always search first to find the correct URL.',
  inputSchema: z.object({
    url: z.string().describe('The docs URL to navigate to'),
    title: z.string().describe('The page title to show in the navigation message'),
  }),
  execute: async ({ url, title }: { url: string; title: string }) => {
    return { action: 'navigate', url, title }
  },
})

export async function POST(req: Request) {
  const body = await req.json()
  const { messages } = body as { messages: unknown[] }
  const mode = req.headers.get('x-chat-mode') as 'search' | 'page' | null
  const rawPageUrl = req.headers.get('x-chat-page')
  // Validate page URL: must be a relative docs path, no traversal
  const pageUrl =
    rawPageUrl && rawPageUrl.startsWith('/docs/') && !rawPageUrl.includes('..')
      ? rawPageUrl
      : null

  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const modelMessages = await convertToModelMessages(messages as Parameters<typeof convertToModelMessages>[0])

  // "This page" mode — no tools, page content as context
  if (mode === 'page' && pageUrl) {
    const content = await getPageContent(pageUrl)
    const pageSystem = content
      ? `${thisPagePrompt}\n\n---\n\nPage: ${pageUrl}\n\n${content}`
      : systemPrompt

    const result = streamText({
      model: openrouter.chat(process.env.OPENROUTER_MODEL ?? 'openai/gpt-5.4-nano'),
      system: pageSystem,
      messages: modelMessages,
    })

    return result.toUIMessageStreamResponse()
  }

  // Default: search mode with tools
  const result = streamText({
    model: openrouter.chat(process.env.OPENROUTER_MODEL ?? 'openai/gpt-5.4-nano'),
    stopWhen: stepCountIs(3),
    tools: { search: searchTool, navigate: navigateTool },
    system: systemPrompt,
    messages: modelMessages,
    toolChoice: 'auto',
  })

  return result.toUIMessageStreamResponse()
}
