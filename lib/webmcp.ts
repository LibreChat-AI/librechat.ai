import { i18n } from '@/lib/i18n'

const DEFAULT_SEARCH_LIMIT = 5
const MAX_SEARCH_LIMIT = 10
const DEFAULT_DOC_CHAR_LIMIT = 12_000
const MAX_DOC_CHAR_LIMIT = 20_000
const MARK_TAG_PATTERN = /<\/?mark>/g

const EXACT_SITE_PATHS = new Set(['/about', '/privacy', '/tos', '/cookie'])
const NESTED_SITE_PATHS = new Set(['docs', 'blog', 'changelog', 'authors', 'toolkit'])

export interface WebMCPSearchResult {
  type: 'page' | 'heading' | 'text'
  title: string
  path: string
  breadcrumbs: string[]
}

interface WebMCPDependencies {
  navigate: (path: string) => void | Promise<void>
  getCurrentUrl: () => URL
  searchDocs?: (query: string, language: string) => Promise<WebMCPSearchResult[]>
  fetcher?: (input: string | URL, init?: RequestInit) => Promise<Response>
}

interface WebMCPContexts {
  navigatorModelContext?: WebMCPModelContext
  documentModelContext?: WebMCPModelContext
}

function getInputObject(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('Tool input must be an object.')
  }
  return input as Record<string, unknown>
}

function getRequiredString(
  input: Record<string, unknown>,
  key: string,
  maximumLength: number,
): string {
  const value = input[key]
  if (typeof value !== 'string' || value.trim() === '' || value.length > maximumLength) {
    throw new TypeError(`${key} must be a non-empty string of at most ${maximumLength} characters.`)
  }
  return value.trim()
}

function getOptionalInteger(
  input: Record<string, unknown>,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const value = input[key]
  if (value === undefined) return fallback
  if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > maximum) {
    throw new TypeError(`${key} must be an integer between ${minimum} and ${maximum}.`)
  }
  return value
}

function isKnownLocale(value: string): boolean {
  return i18n.languages.includes(value)
}

export function getLocaleFromPathname(pathname: string): string {
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  return firstSegment && isKnownLocale(firstSegment) ? firstSegment : i18n.defaultLanguage
}

function getSearchLanguage(input: Record<string, unknown>, pathname: string): string {
  const value = input.language
  if (value === undefined) return getLocaleFromPathname(pathname)
  if (typeof value !== 'string' || !isKnownLocale(value)) {
    throw new TypeError(`language must be one of: ${i18n.languages.join(', ')}.`)
  }
  return value
}

function isAllowedSitePath(pathname: string): boolean {
  if (pathname === '/' || EXACT_SITE_PATHS.has(pathname)) return true

  const segments = pathname.split('/').filter(Boolean)
  const [firstSegment, secondSegment] = segments

  if (firstSegment && isKnownLocale(firstSegment)) {
    return segments.length === 1 || secondSegment === 'docs'
  }

  return firstSegment !== undefined && NESTED_SITE_PATHS.has(firstSegment)
}

export function normalizeNavigablePath(path: string, currentUrl: URL): string {
  if (!path.startsWith('/')) {
    throw new TypeError('path must be an internal path beginning with /.')
  }

  const targetUrl = new URL(path, currentUrl.origin)
  if (targetUrl.origin !== currentUrl.origin || !isAllowedSitePath(targetUrl.pathname)) {
    throw new TypeError('path must point to a supported page on this site.')
  }

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
}

function normalizeEnglishDocsPath(path: string, currentUrl: URL): string {
  const normalized = normalizeNavigablePath(path, currentUrl)
  const { pathname } = new URL(normalized, currentUrl.origin)
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] && isKnownLocale(segments[0])) {
    segments.shift()
  }

  if (segments[0] !== 'docs') {
    throw new TypeError('path must point to a documentation page.')
  }

  return `/${segments.join('/')}`
}

async function searchDocumentation(query: string, language: string): Promise<WebMCPSearchResult[]> {
  const { createDocsSearchClient } = await import('@/lib/search-client')
  const results = await createDocsSearchClient(language).search(query)

  return results.map((result) => ({
    type: result.type,
    title: result.content.replaceAll(MARK_TAG_PATTERN, ''),
    path: result.url,
    breadcrumbs: (result.breadcrumbs ?? []).map((item) => item.replaceAll(MARK_TAG_PATTERN, '')),
  }))
}

export function createWebMCPTools({
  navigate,
  getCurrentUrl,
  searchDocs = searchDocumentation,
  fetcher = (input, init) => fetch(input, init),
}: WebMCPDependencies): WebMCPToolDefinition[] {
  const languageSchema = {
    type: 'string',
    enum: i18n.languages,
    description: 'Documentation language. Defaults to the language of the current page.',
  }

  return [
    {
      name: 'search_librechat_docs',
      title: 'Search LibreChat documentation',
      description:
        'Search the LibreChat documentation in a supported language. Returns ranked page and section paths that can be passed to the navigation or documentation retrieval tools.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            description: 'Keywords or a question to search for.',
          },
          language: languageSchema,
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: MAX_SEARCH_LIMIT,
            default: DEFAULT_SEARCH_LIMIT,
            description: 'Maximum number of results to return.',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute(rawInput) {
        const input = getInputObject(rawInput)
        const query = getRequiredString(input, 'query', 200)
        const currentUrl = getCurrentUrl()
        const language = getSearchLanguage(input, currentUrl.pathname)
        const limit = getOptionalInteger(input, 'limit', DEFAULT_SEARCH_LIMIT, 1, MAX_SEARCH_LIMIT)
        const results = await searchDocs(query, language)

        return { query, language, results: results.slice(0, limit) }
      },
    },
    {
      name: 'navigate_librechat_site',
      title: 'Navigate the LibreChat site',
      description:
        'Navigate the current tab to an internal LibreChat documentation, blog, changelog, author, toolkit, project, or policy page. External URLs and API routes are rejected.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            minLength: 1,
            maxLength: 512,
            pattern: '^/',
            description: 'Internal path returned by search, for example /docs/features/agents.',
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(rawInput) {
        const input = getInputObject(rawInput)
        const requestedPath = getRequiredString(input, 'path', 512)
        const path = normalizeNavigablePath(requestedPath, getCurrentUrl())
        await navigate(path)
        return { navigated: true, path }
      },
    },
    {
      name: 'get_librechat_doc',
      title: 'Get LibreChat documentation',
      description:
        'Retrieve bounded Markdown from an English LibreChat documentation page. Localized documentation paths are resolved to their English source.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            minLength: 1,
            maxLength: 512,
            pattern: '^/(?:[A-Za-z-]+/)?docs(?:/|$)',
            description: 'Documentation path returned by search.',
          },
          maxCharacters: {
            type: 'integer',
            minimum: 1000,
            maximum: MAX_DOC_CHAR_LIMIT,
            default: DEFAULT_DOC_CHAR_LIMIT,
            description: 'Maximum number of Markdown characters to return.',
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute(rawInput) {
        const input = getInputObject(rawInput)
        const requestedPath = getRequiredString(input, 'path', 512)
        const maxCharacters = getOptionalInteger(
          input,
          'maxCharacters',
          DEFAULT_DOC_CHAR_LIMIT,
          1000,
          MAX_DOC_CHAR_LIMIT,
        )
        const currentUrl = getCurrentUrl()
        const path = normalizeEnglishDocsPath(requestedPath, currentUrl)
        const endpoint = new URL(`/llms.mdx${path}`, currentUrl.origin)
        const response = await fetcher(endpoint, {
          headers: { Accept: 'text/markdown' },
        })

        if (!response.ok) {
          throw new Error(`Documentation request failed with status ${response.status}.`)
        }

        const markdown = await response.text()
        return {
          path,
          markdown: markdown.slice(0, maxCharacters),
          truncated: markdown.length > maxCharacters,
        }
      },
    },
  ]
}

export function registerWebMCPTools(
  tools: WebMCPToolDefinition[],
  signal: AbortSignal,
  contexts: WebMCPContexts = {},
): boolean {
  const navigatorModelContext =
    contexts.navigatorModelContext ??
    (typeof navigator === 'undefined' ? undefined : navigator.modelContext)
  const documentModelContext =
    contexts.documentModelContext ??
    (typeof document === 'undefined' ? undefined : document.modelContext)
  const modelContext = navigatorModelContext ?? documentModelContext

  if (!modelContext) return false

  for (const tool of tools) {
    void modelContext.registerTool(tool, { signal }).catch((error: unknown) => {
      if (!signal.aborted) {
        console.error(`[WebMCP] Failed to register ${tool.name}:`, error)
      }
    })
  }

  return true
}
