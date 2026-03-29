/**
 * Generate AI conversation starters for each docs page — INCREMENTALLY.
 *
 * Usage:  npx tsx scripts/generate-starters.ts
 *
 * How it works:
 *   1. Reads every MDX file under content/docs/
 *   2. Hashes each file's content (SHA-256)
 *   3. Compares against the stored hashes in public/starters-hashes.json
 *   4. Only sends CHANGED or NEW pages to the LLM — one call per batch
 *   5. Merges results into the existing public/starters.json
 *   6. Removes entries for deleted pages
 *
 * Cost: ~$0.00 when nothing changed; a few cents for a handful of edits.
 *       First run generates everything (~$0.01-0.02).
 *
 * The LLM receives actual page content (truncated to 2000 chars) so
 * starters are accurate and specific to what the page teaches.
 *
 * Flags:
 *   --force    Regenerate ALL pages (ignore hashes)
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createHash } from 'node:crypto'

const DOCS_DIR = join(process.cwd(), 'content/docs')
const STARTERS_PATH = join(process.cwd(), 'public/starters.json')
const HASHES_PATH = join(process.cwd(), 'public/starters-hashes.json')
const MODEL = process.env.OPENROUTER_MODEL ?? 'openai/gpt-5.4-nano'
const API_KEY = process.env.OPENROUTER_API_KEY
const FORCE = process.argv.includes('--force')
const BATCH_SIZE = 30 // pages per LLM call — balances cost vs. request count

if (!API_KEY) {
  console.error('OPENROUTER_API_KEY is required. Set it in .env or pass it directly.')
  process.exit(1)
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

interface PageInfo {
  url: string
  title: string
  description: string
  content: string // first 2000 chars of body (after frontmatter)
  hash: string // SHA-256 of the raw file
}

async function getMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await getMdxFiles(full)))
    else if (entry.name.endsWith('.mdx')) files.push(full)
  }
  return files
}

function parseFrontmatter(raw: string): { title: string; description: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n*([\s\S]*)$/)
  if (!match) return { title: '', description: '', body: raw }
  const fm = match[1]
  return {
    title: fm.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? '',
    description: fm.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? '',
    body: match[2],
  }
}

function filePathToUrl(filePath: string): string {
  const rel = relative(DOCS_DIR, filePath)
    .replace(/\.mdx$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
  return `/docs${rel ? `/${rel}` : ''}`
}

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, 'utf-8')) as T
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/*  Collect pages                                                             */
/* -------------------------------------------------------------------------- */

async function collectPages(): Promise<PageInfo[]> {
  const files = await getMdxFiles(DOCS_DIR)
  const pages: PageInfo[] = []

  for (const file of files) {
    const raw = await readFile(file, 'utf-8')
    const { title, description, body } = parseFrontmatter(raw)
    if (!title) continue
    pages.push({
      url: filePathToUrl(file),
      title,
      description,
      content: body.slice(0, 2000),
      hash: sha256(raw),
    })
  }

  return pages.sort((a, b) => a.url.localeCompare(b.url))
}

/* -------------------------------------------------------------------------- */
/*  Diff against stored hashes                                                */
/* -------------------------------------------------------------------------- */

function findChangedPages(
  pages: PageInfo[],
  oldHashes: Record<string, string>,
): { changed: PageInfo[]; removed: string[] } {
  const changed: PageInfo[] = []
  const currentUrls = new Set<string>()

  for (const page of pages) {
    currentUrls.add(page.url)
    if (FORCE || oldHashes[page.url] !== page.hash) {
      changed.push(page)
    }
  }

  const removed = Object.keys(oldHashes).filter((url) => !currentUrls.has(url))
  return { changed, removed }
}

/* -------------------------------------------------------------------------- */
/*  LLM call — sends actual content for accuracy                             */
/* -------------------------------------------------------------------------- */

async function generateStartersForBatch(
  pages: PageInfo[],
): Promise<Record<string, string[]>> {
  const entries = pages
    .map(
      (p) =>
        `--- PAGE: ${p.url} ---\nTitle: ${p.title}\nDescription: ${p.description}\n\n${p.content}\n`,
    )
    .join('\n')

  const prompt = `You generate conversation starter questions for a docs chatbot.

Below are documentation pages with their actual content. For each page URL, generate exactly 3 short questions a user reading that page would ask.

Rules:
- Questions must be SPECIFIC to the page content — reference actual features, config keys, commands, or concepts from the text
- Sound natural and conversational (4-10 words)
- Be actionable: "How do I...", "What does X do?", "Troubleshoot Y"
- Don't repeat the page title as a question

${entries}

Respond with ONLY valid JSON. No markdown fences, no explanation.
{
  "/docs/path": ["Question 1?", "Question 2?", "Question 3?"]
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
      max_tokens: 8000,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[]
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }

  if (data.usage) {
    console.log(
      `  Batch tokens: ${data.usage.prompt_tokens} in + ${data.usage.completion_tokens} out = ${data.usage.total_tokens}`,
    )
  }

  const content = data.choices[0]?.message?.content ?? ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Failed to parse JSON from LLM response:\n${content.slice(0, 500)}`)
  }

  return JSON.parse(jsonMatch[0]) as Record<string, string[]>
}

/* -------------------------------------------------------------------------- */
/*  Main                                                                      */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log('Collecting docs pages...')
  const pages = await collectPages()
  console.log(`Found ${pages.length} pages`)

  // Load existing data
  const oldHashes = (await readJson<Record<string, string>>(HASHES_PATH)) ?? {}
  const oldStarters = (await readJson<Record<string, string[]>>(STARTERS_PATH)) ?? {}

  // Diff
  const { changed, removed } = findChangedPages(pages, oldHashes)

  if (changed.length === 0 && removed.length === 0) {
    console.log('No changes detected — starters are up to date.')
    return
  }

  console.log(`${changed.length} changed/new, ${removed.length} removed`)

  // Generate starters for changed pages in batches
  const newStarters: Record<string, string[]> = { ...oldStarters }

  for (let i = 0; i < changed.length; i += BATCH_SIZE) {
    const batch = changed.slice(i, i + BATCH_SIZE)
    console.log(`Generating batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} pages)...`)
    const result = await generateStartersForBatch(batch)
    Object.assign(newStarters, result)
  }

  // Remove deleted pages
  for (const url of removed) {
    delete newStarters[url]
    console.log(`  Removed: ${url}`)
  }

  // Ensure default entry exists
  if (!newStarters['default']) {
    newStarters['default'] = [
      'How do I get started with LibreChat?',
      'What AI providers are supported?',
      'How do I configure Docker?',
    ]
  }

  // Build new hashes map
  const newHashes: Record<string, string> = {}
  for (const page of pages) {
    newHashes[page.url] = page.hash
  }

  // Write outputs
  // Sort keys for stable diffs
  const sorted: Record<string, string[]> = {}
  for (const key of Object.keys(newStarters).sort()) {
    sorted[key] = newStarters[key]
  }

  await writeFile(STARTERS_PATH, JSON.stringify(sorted, null, 2) + '\n')
  await writeFile(HASHES_PATH, JSON.stringify(newHashes, null, 2) + '\n')

  const total = Object.keys(sorted).length
  console.log(`\nDone — ${total} pages in ${STARTERS_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
