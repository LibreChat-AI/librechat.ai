import { findMcpDocument, getMcpDocuments } from '@/lib/mcp-documents'
import {
  MCP_LEGACY_PROTOCOL_VERSIONS,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_CAPABILITIES,
  MCP_SERVER_INFO,
  MCP_SUPPORTED_PROTOCOL_VERSIONS,
} from '@/lib/mcp-server-metadata'
import { absoluteUrl } from '@/lib/structured-data'

export {
  MCP_LEGACY_PROTOCOL_VERSIONS,
  MCP_PROTOCOL_VERSION,
  MCP_SERVER_CAPABILITIES,
  MCP_SERVER_INFO,
  MCP_SUPPORTED_PROTOCOL_VERSIONS,
}

export class McpProtocolError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'McpProtocolError'
  }
}

const TOOLS = [
  {
    name: 'search_documentation',
    title: 'Search LibreChat Documentation',
    description: 'Search LibreChat documentation and return the most relevant pages and excerpts.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Words or a question to search for.',
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          default: 5,
          description: 'Maximum number of results.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'get_documentation_page',
    title: 'Read a LibreChat Documentation Page',
    description: 'Read the Markdown source of one LibreChat documentation page.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          minLength: 1,
          maxLength: 500,
          description: 'A LibreChat docs path, canonical URL, or docs://librechat resource URI.',
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
] as const

const RESOURCES = [
  {
    uri: 'docs://librechat/index',
    name: 'librechat-documentation-index',
    title: 'LibreChat Documentation Index',
    description: 'An index of every English LibreChat documentation page.',
    mimeType: 'text/markdown',
  },
] as const

const RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'docs://librechat/{path}',
    name: 'librechat-documentation-page',
    title: 'LibreChat Documentation Page',
    description: 'A documentation page, using its path after /docs/.',
    mimeType: 'text/markdown',
  },
] as const

const PROMPTS = [
  {
    name: 'answer_librechat_question',
    title: 'Answer a LibreChat Documentation Question',
    description:
      'Guide a model to answer a question using only the official LibreChat documentation.',
    arguments: [
      {
        name: 'question',
        description: 'The LibreChat question to research and answer.',
        required: true,
      },
      {
        name: 'topic',
        description: 'An optional product area or documentation path to prioritize.',
        required: false,
      },
    ],
  },
] as const

type UnknownRecord = Record<string, unknown>
function asRecord(value: unknown, message = 'Expected an object'): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new McpProtocolError(-32602, 'Invalid params', { message })
  }
  return value as UnknownRecord
}

function requiredString(
  object: UnknownRecord,
  key: string,
  { maxLength = 500 }: { maxLength?: number } = {},
): string {
  const value = object[key]
  if (typeof value !== 'string' || value.trim() === '' || value.length > maxLength) {
    throw new McpProtocolError(-32602, 'Invalid params', {
      message: `${key} must be a non-empty string of at most ${maxLength} characters`,
    })
  }
  return value.trim()
}

function excerptFor(markdown: string, terms: string[]): string {
  const lower = markdown.toLocaleLowerCase('en')
  const firstMatch = terms.reduce((best, term) => {
    const index = lower.indexOf(term)
    return index >= 0 && (best < 0 || index < best) ? index : best
  }, -1)
  const start = Math.max(0, firstMatch < 0 ? 0 : firstMatch - 250)
  const prefix = start > 0 ? '...' : ''
  const suffix = start + 1200 < markdown.length ? '...' : ''
  return `${prefix}${markdown.slice(start, start + 1200).trim()}${suffix}`
}

async function searchDocumentation(argumentsValue: unknown) {
  const argumentsObject = asRecord(argumentsValue)
  const query = requiredString(argumentsObject, 'query', { maxLength: 200 })
  const requestedLimit = argumentsObject.limit ?? 5
  if (
    typeof requestedLimit !== 'number' ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > 10
  ) {
    throw new McpProtocolError(-32602, 'Invalid params', {
      message: 'limit must be an integer from 1 to 10',
    })
  }

  const terms = query.toLocaleLowerCase('en').split(/\s+/).filter(Boolean)
  const docs = await getMcpDocuments()
  const results = docs
    .map((doc) => {
      const title = doc.title.toLocaleLowerCase('en')
      const description = doc.description.toLocaleLowerCase('en')
      const score = terms.reduce((total, term) => {
        if (!doc.searchable.includes(term)) return total
        return total + (title.includes(term) ? 10 : 0) + (description.includes(term) ? 5 : 0) + 1
      }, 0)
      return { doc, score }
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, requestedLimit)
    .map(({ doc }) => ({
      title: doc.title,
      url: absoluteUrl(doc.url),
      description: doc.description,
      excerpt: excerptFor(doc.markdown, terms),
    }))

  return {
    content: [{ type: 'text', text: JSON.stringify({ query, results }, null, 2) }],
    structuredContent: { query, results },
    isError: false,
  }
}

async function readDocumentationPage(reference: string, notFoundCode = -32002) {
  const document = await findMcpDocument(reference)
  if (!document) {
    throw new McpProtocolError(notFoundCode, 'Resource not found', { uri: reference })
  }
  return document
}

async function getDocumentationPage(argumentsValue: unknown, notFoundCode: number) {
  const argumentsObject = asRecord(argumentsValue)
  const reference = requiredString(argumentsObject, 'path')
  const document = await readDocumentationPage(reference, notFoundCode)

  return {
    content: [{ type: 'text', text: document.markdown }],
    structuredContent: {
      title: document.title,
      url: absoluteUrl(document.url),
    },
    isError: false,
  }
}

async function renderDocumentationIndex(): Promise<string> {
  const documents = await getMcpDocuments()
  const entries = documents.map((document) => {
    const description = document.description ? `: ${document.description}` : ''
    return `- [${document.title}](${absoluteUrl(document.url)})${description}`
  })
  return `# LibreChat Documentation Index\n\n${entries.join('\n')}`
}

async function callTool(params: unknown, notFoundCode: number) {
  const paramsObject = asRecord(params)
  const name = requiredString(paramsObject, 'name', { maxLength: 100 })
  const argumentsValue = paramsObject.arguments ?? {}

  switch (name) {
    case 'search_documentation':
      return searchDocumentation(argumentsValue)
    case 'get_documentation_page':
      return getDocumentationPage(argumentsValue, notFoundCode)
    default:
      throw new McpProtocolError(-32602, 'Invalid params', { message: `Unknown tool: ${name}` })
  }
}

async function readResource(params: unknown, notFoundCode: number) {
  const paramsObject = asRecord(params)
  const uri = requiredString(paramsObject, 'uri', { maxLength: 1000 })

  if (uri === 'docs://librechat/index') {
    return {
      contents: [{ uri, mimeType: 'text/markdown', text: await renderDocumentationIndex() }],
    }
  }
  if (uri.startsWith('docs://librechat/')) {
    const document = await readDocumentationPage(uri, notFoundCode)
    return { contents: [{ uri, mimeType: 'text/markdown', text: document.markdown }] }
  }

  throw new McpProtocolError(-32002, 'Resource not found', { uri })
}

function getPrompt(params: unknown) {
  const paramsObject = asRecord(params)
  const name = requiredString(paramsObject, 'name', { maxLength: 100 })
  if (name !== 'answer_librechat_question') {
    throw new McpProtocolError(-32602, 'Invalid params', { message: `Unknown prompt: ${name}` })
  }

  const argumentsObject = asRecord(paramsObject.arguments ?? {})
  const question = requiredString(argumentsObject, 'question', { maxLength: 2000 })
  const { topic } = argumentsObject
  if (topic !== undefined && (typeof topic !== 'string' || topic.length > 500)) {
    throw new McpProtocolError(-32602, 'Invalid params', {
      message: 'topic must be a string of at most 500 characters',
    })
  }

  const topicInstruction = topic?.trim()
    ? ` Prioritize documentation related to this topic: ${topic.trim()}.`
    : ''

  return {
    description: 'Research and answer a LibreChat question from official documentation.',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Answer this LibreChat question: ${question}${topicInstruction} Use search_documentation first, read the most relevant pages when needed, cite canonical LibreChat documentation URLs, and do not invent unsupported configuration or behavior.`,
        },
      },
    ],
  }
}

function initialize(params: unknown) {
  const paramsObject = asRecord(params)
  const requestedVersion = paramsObject.protocolVersion
  const protocolVersion = MCP_LEGACY_PROTOCOL_VERSIONS.includes(
    requestedVersion as (typeof MCP_LEGACY_PROTOCOL_VERSIONS)[number],
  )
    ? requestedVersion
    : MCP_LEGACY_PROTOCOL_VERSIONS[0]

  return {
    protocolVersion,
    capabilities: MCP_SERVER_CAPABILITIES,
    serverInfo: MCP_SERVER_INFO,
    instructions:
      'Use the tools and resources to answer questions from the official LibreChat documentation.',
  }
}

const CACHE_TTL_MS = 60 * 60 * 1000
const CACHEABLE_METHODS = new Set([
  'server/discover',
  'tools/list',
  'prompts/list',
  'resources/list',
  'resources/templates/list',
  'resources/read',
])

function completeResult(method: string, result: unknown): UnknownRecord {
  const resultObject = asRecord(result, 'Expected an MCP result object')
  const existingMeta =
    typeof resultObject._meta === 'object' && resultObject._meta !== null
      ? (resultObject._meta as UnknownRecord)
      : {}

  return {
    resultType: 'complete',
    ...resultObject,
    ...(CACHEABLE_METHODS.has(method)
      ? { ttlMs: CACHE_TTL_MS, cacheScope: 'public' as const }
      : {}),
    _meta: {
      ...existingMeta,
      'io.modelcontextprotocol/serverInfo': MCP_SERVER_INFO,
    },
  }
}

export async function handleMcpMethod(
  method: string,
  params: unknown,
  { protocolVersion = MCP_PROTOCOL_VERSION }: { protocolVersion?: string } = {},
): Promise<unknown> {
  const modern = protocolVersion === MCP_PROTOCOL_VERSION
  let result: unknown

  switch (method) {
    case 'initialize':
      if (modern) {
        throw new McpProtocolError(-32601, 'Method not found', {
          method,
          supported: MCP_SUPPORTED_PROTOCOL_VERSIONS,
        })
      }
      result = initialize(params)
      break
    case 'server/discover':
      if (!modern) throw new McpProtocolError(-32601, 'Method not found', { method })
      result = {
        supportedVersions: MCP_SUPPORTED_PROTOCOL_VERSIONS,
        capabilities: MCP_SERVER_CAPABILITIES,
        instructions:
          'Use the tools and resources to answer questions from the official LibreChat documentation.',
      }
      break
    case 'ping':
      result = {}
      break
    case 'tools/list':
      result = { tools: TOOLS }
      break
    case 'tools/call':
      result = await callTool(params, modern ? -32602 : -32002)
      break
    case 'resources/list':
      result = { resources: RESOURCES }
      break
    case 'resources/templates/list':
      result = { resourceTemplates: RESOURCE_TEMPLATES }
      break
    case 'resources/read':
      result = await readResource(params, modern ? -32602 : -32002)
      break
    case 'prompts/list':
      result = { prompts: PROMPTS }
      break
    case 'prompts/get':
      result = getPrompt(params)
      break
    default:
      throw new McpProtocolError(-32601, 'Method not found', { method })
  }

  return modern ? completeResult(method, result) : result
}
