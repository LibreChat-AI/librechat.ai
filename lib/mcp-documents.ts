import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import matter from 'gray-matter'
import { i18n } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/structured-data'

export interface McpDocument {
  path: string
  url: string
  title: string
  description: string
  markdown: string
  searchable: string
}

const DOCS_DIRECTORY = join(process.cwd(), 'content', 'docs')
const LOCALIZED_SUFFIXES = i18n.languages
  .filter((language) => language !== i18n.defaultLanguage)
  .map((language) => `.${language}.mdx`)

let documentsPromise: Promise<McpDocument[]> | undefined
let documentsByUrlPromise: Promise<Map<string, McpDocument>> | undefined

async function collectMdxFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = join(directory, entry.name)
      return entry.isDirectory() ? collectMdxFiles(entryPath) : [entryPath]
    }),
  )
  return files.flat()
}

function isDefaultLanguageDocument(filePath: string): boolean {
  return (
    filePath.endsWith('.mdx') && !LOCALIZED_SUFFIXES.some((suffix) => filePath.endsWith(suffix))
  )
}

function documentUrl(filePath: string): string {
  const relativePath = relative(DOCS_DIRECTORY, filePath).split(sep).join('/')
  const slug = relativePath.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '')
  return `/docs${slug ? `/${slug}` : ''}`
}

function titleFromPath(filePath: string): string {
  const name =
    filePath
      .split(sep)
      .at(-1)
      ?.replace(/\.mdx$/, '') ?? 'Documentation'
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

async function loadDocument(filePath: string): Promise<McpDocument> {
  const source = await readFile(filePath, 'utf8')
  const { content, data } = matter(source)
  const title = typeof data.title === 'string' ? data.title : titleFromPath(filePath)
  const description = typeof data.description === 'string' ? data.description : ''
  const url = documentUrl(filePath)
  const markdown = `# ${title} (${absoluteUrl(url)})\n\n${content.trim()}`

  return {
    path: relative(DOCS_DIRECTORY, filePath).split(sep).join('/'),
    url,
    title,
    description,
    markdown,
    searchable: `${title}\n${description}\n${content}`.toLocaleLowerCase('en'),
  }
}

export async function getMcpDocuments(): Promise<McpDocument[]> {
  documentsPromise ??= collectMdxFiles(DOCS_DIRECTORY).then(async (files) => {
    const documents = await Promise.all(files.filter(isDefaultLanguageDocument).map(loadDocument))
    return documents.sort((left, right) => left.url.localeCompare(right.url, 'en'))
  })
  return documentsPromise
}

async function getDocumentsByUrl(): Promise<Map<string, McpDocument>> {
  documentsByUrlPromise ??= getMcpDocuments().then(
    (documents) => new Map(documents.map((document) => [document.url, document])),
  )
  return documentsByUrlPromise
}

function pathFromReference(reference: string): string | undefined {
  if (reference.includes('..') || reference.includes('\\') || reference.includes('\0')) {
    return undefined
  }

  let pathname: string
  try {
    if (reference.startsWith('docs://')) {
      const url = new URL(reference)
      if (url.hostname !== 'librechat') return undefined
      pathname = `/docs${url.pathname}`
    } else {
      const baseUrl = new URL(absoluteUrl('/'))
      const url = new URL(reference.startsWith('/') ? reference : `/docs/${reference}`, baseUrl)
      if (url.origin !== baseUrl.origin) return undefined
      pathname = url.pathname
    }
    pathname = decodeURIComponent(pathname)
  } catch {
    return undefined
  }

  pathname = pathname.replace(/\.mdx?$/, '').replace(/\/$/, '') || '/docs'
  if (pathname !== '/docs' && !pathname.startsWith('/docs/')) return undefined
  return pathname
}

export async function findMcpDocument(reference: string): Promise<McpDocument | undefined> {
  const pathname = pathFromReference(reference)
  if (!pathname) return undefined
  return (await getDocumentsByUrl()).get(pathname)
}
