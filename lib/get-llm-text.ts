import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { docsSource } from '@/lib/source'
import type { InferPageType } from 'fumadocs-core/source'

export async function getLLMText(page: InferPageType<typeof docsSource>): Promise<string> {
  const filePath = join(process.cwd(), 'content/docs', page.file.path)
  const raw = await readFile(filePath, 'utf-8')

  // Strip frontmatter
  const content = raw.replace(/^---[\s\S]*?---\n*/, '')

  return `# ${page.data.title} (${page.url})

${content}`
}
