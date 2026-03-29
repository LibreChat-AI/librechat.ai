/**
 * Generate AI conversation starters for each docs page.
 *
 * Run at build time: `npx tsx scripts/generate-starters.ts`
 * Costs ~$0.01 per run (single LLM call with all page metadata).
 *
 * Outputs: public/starters.json — { "/docs/path": ["Q1", "Q2", "Q3"] }
 *
 * The generated file is committed to the repo so it's available at runtime
 * without any LLM calls. Re-run when docs structure changes significantly.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const DOCS_DIR = join(process.cwd(), 'content/docs')
const OUTPUT_PATH = join(process.cwd(), 'public/starters.json')
const MODEL = process.env.OPENROUTER_MODEL ?? 'openai/gpt-5.4-nano'
const API_KEY = process.env.OPENROUTER_API_KEY

if (!API_KEY) {
  console.error('OPENROUTER_API_KEY is required. Set it in .env or pass it directly.')
  process.exit(1)
}

interface PageMeta {
  url: string
  title: string
  description: string
}

async function getMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getMdxFiles(full)))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

function parseFrontmatter(raw: string): { title: string; description: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return { title: '', description: '' }
  const fm = match[1]
  const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? ''
  const description = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ''
  return { title, description }
}

function filePathToUrl(filePath: string): string {
  const rel = relative(DOCS_DIR, filePath)
    .replace(/\.mdx$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
  return `/docs${rel ? `/${rel}` : ''}`
}

async function collectPages(): Promise<PageMeta[]> {
  const files = await getMdxFiles(DOCS_DIR)
  const pages: PageMeta[] = []

  for (const file of files) {
    const raw = await readFile(file, 'utf-8')
    const { title, description } = parseFrontmatter(raw)
    if (!title) continue
    pages.push({ url: filePathToUrl(file), title, description })
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url))
}

async function generateStarters(pages: PageMeta[]): Promise<Record<string, string[]>> {
  // Build a compact manifest: one line per page
  const manifest = pages
    .map((p) => `${p.url} | ${p.title} | ${p.description}`)
    .join('\n')

  const prompt = `You are generating conversation starter questions for a docs chatbot on the LibreChat documentation site.

Below is a list of documentation pages (URL | Title | Description):

${manifest}

For each page URL, generate exactly 3 short, practical questions a user on that page would likely ask. Questions should:
- Be specific to that page's topic (not generic)
- Sound natural and conversational
- Be actionable (how to do X, troubleshoot Y, configure Z)
- Be 4-10 words long

Also generate a "default" entry for users not on a specific docs page.

Respond with ONLY valid JSON — no markdown, no explanation. Format:
{
  "/docs/path": ["Question 1?", "Question 2?", "Question 3?"],
  "default": ["Question 1?", "Question 2?", "Question 3?"]
}`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 16000,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[]
    usage?: { total_tokens: number; prompt_tokens: number; completion_tokens: number }
  }

  const content = data.choices[0]?.message?.content ?? ''

  if (data.usage) {
    console.log(
      `Tokens: ${data.usage.prompt_tokens} in + ${data.usage.completion_tokens} out = ${data.usage.total_tokens} total`,
    )
  }

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Failed to parse JSON from LLM response:\n${content.slice(0, 500)}`)
  }

  return JSON.parse(jsonMatch[0]) as Record<string, string[]>
}

async function main() {
  console.log('Collecting docs pages...')
  const pages = await collectPages()
  console.log(`Found ${pages.length} pages`)

  console.log(`Generating starters with ${MODEL}...`)
  const starters = await generateStarters(pages)

  const count = Object.keys(starters).length
  console.log(`Generated starters for ${count} pages`)

  await writeFile(OUTPUT_PATH, JSON.stringify(starters, null, 2) + '\n')
  console.log(`Written to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
