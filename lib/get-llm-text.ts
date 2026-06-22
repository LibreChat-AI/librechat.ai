import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { docsSource } from '@/lib/source'
import { i18n } from '@/lib/i18n'
import type { InferPageType } from 'fumadocs-core/source'

export const SITE_URL = 'https://www.librechat.ai'

type DocsPage = InferPageType<typeof docsSource>
type TreeNode = (typeof docsSource)['pageTree'][string]['children'][number]

/**
 * Walk the page tree depth-first and collect page URLs in navigation order,
 * descending into folders (and including their index page) and ignoring
 * separators. This mirrors the sidebar order defined by the docs meta.json
 * files.
 */
function collectTreeUrls(nodes: readonly TreeNode[], urls: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'folder') {
      if (node.index) urls.push(node.index.url)
      collectTreeUrls(node.children, urls)
    } else if (node.type === 'page') {
      urls.push(node.url)
    }
  }
  return urls
}

/**
 * Return the docs pages ordered to match the documentation navigation (the
 * curated meta.json table of contents) rather than the arbitrary order in
 * which the content files happen to be discovered. Any page that is not
 * reachable from the tree is appended at the end so nothing is dropped.
 */
export function getOrderedDocsPages(): DocsPage[] {
  const lang = i18n.defaultLanguage
  const tree = docsSource.pageTree[lang] ?? docsSource.pageTree[i18n.defaultLanguage]
  // Pass the default language explicitly so generated *.<locale>.mdx pages can
  // never leak into the English export.
  const pages = docsSource.getPages(lang)
  const pagesByUrl = new Map(pages.map((page) => [page.url, page]))

  const ordered: DocsPage[] = []
  const seen = new Set<string>()

  for (const url of collectTreeUrls(tree?.children ?? [])) {
    const page = pagesByUrl.get(url)
    if (page && !seen.has(url)) {
      ordered.push(page)
      seen.add(url)
    }
  }

  for (const page of pages) {
    if (!seen.has(page.url)) {
      ordered.push(page)
      seen.add(page.url)
    }
  }

  return ordered
}

export const MARKDOWN_RESPONSE_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

export async function getLLMText(page: InferPageType<typeof docsSource>): Promise<string> {
  const filePath = page.absolutePath ?? join(process.cwd(), 'content/docs', page.path)
  const raw = await readFile(filePath, 'utf-8')

  // Strip frontmatter
  const content = raw.replace(/^---[\s\S]*?---\n*/, '')

  return `# ${page.data.title} (${absoluteUrl(page.url)})

${content}`
}
