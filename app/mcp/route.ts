import { createRateLimiter, getClientIp } from '@/lib/rate-limit'
import {
  handleMcpMethod,
  MCP_PROTOCOL_VERSION,
  MCP_SUPPORTED_PROTOCOL_VERSIONS,
  McpProtocolError,
} from '@/lib/mcp-server'
import { SITE_URL } from '@/lib/structured-data'

export const runtime = 'nodejs'

const MAX_BODY_LENGTH = 64 * 1024
const DEFAULT_PROTOCOL_VERSION = '2025-03-26'
const isRateLimited = createRateLimiter(120, 60_000)

type JsonRpcId = string | number | null
type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidId(value: unknown): value is JsonRpcId {
  return value === null || typeof value === 'string' || typeof value === 'number'
}

function decodeMirroredHeader(value: string | null): string | null {
  if (!value?.startsWith('=?base64?') || !value.endsWith('?=')) return value

  try {
    return Buffer.from(value.slice('=?base64?'.length, -'?='.length), 'base64').toString('utf8')
  } catch {
    return null
  }
}

function allowedOrigin(request: Request): string | null {
  const origin = request.headers.get('origin')
  if (!origin) return null

  try {
    const parsedOrigin = new URL(origin).origin
    if (parsedOrigin === new URL(SITE_URL).origin || parsedOrigin === 'https://librechat.ai') {
      return parsedOrigin
    }
    if (process.env.NODE_ENV !== 'production' && parsedOrigin === new URL(request.url).origin) {
      return parsedOrigin
    }
  } catch {
    return null
  }

  return null
}

function hasValidOrigin(request: Request): boolean {
  return !request.headers.has('origin') || allowedOrigin(request) !== null
}

function responseHeaders(request: Request, protocolVersion = MCP_PROTOCOL_VERSION): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'MCP-Protocol-Version': protocolVersion,
  })
  const origin = allowedOrigin(request)
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, MCP-Protocol-Version, Mcp-Method, Mcp-Name',
    )
    headers.set('Access-Control-Expose-Headers', 'MCP-Protocol-Version')
    headers.set('Vary', 'Origin')
  }
  return headers
}

function jsonRpcError(
  request: Request,
  id: JsonRpcId,
  code: number,
  message: string,
  {
    data,
    status = 200,
    protocolVersion,
  }: { data?: unknown; status?: number; protocolVersion?: string } = {},
): Response {
  return Response.json(
    {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        ...(data === undefined ? {} : { data }),
      },
    },
    {
      status,
      headers: responseHeaders(request, protocolVersion),
    },
  )
}

function methodNotAllowed() {
  return new Response(null, {
    status: 405,
    headers: {
      Allow: 'POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  })
}

export function GET() {
  return methodNotAllowed()
}

export function DELETE() {
  return methodNotAllowed()
}

export function OPTIONS(request: Request) {
  if (!hasValidOrigin(request)) {
    return jsonRpcError(request, null, -32000, 'Invalid Origin', { status: 403 })
  }
  return new Response(null, {
    status: 204,
    headers: responseHeaders(request),
  })
}

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) {
    return jsonRpcError(request, null, -32000, 'Invalid Origin', { status: 403 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLocaleLowerCase('en').includes('application/json')) {
    return jsonRpcError(request, null, -32600, 'Content-Type must be application/json', {
      status: 415,
    })
  }

  const accept = request.headers.get('accept')
  if (
    accept &&
    (!accept.includes('application/json') || !accept.includes('text/event-stream')) &&
    !accept.includes('*/*')
  ) {
    return jsonRpcError(
      request,
      null,
      -32600,
      'Accept must include application/json and text/event-stream',
      {
        status: 406,
      },
    )
  }

  const declaredProtocolVersion = request.headers.get('mcp-protocol-version')
  if (
    declaredProtocolVersion &&
    !MCP_SUPPORTED_PROTOCOL_VERSIONS.includes(
      declaredProtocolVersion as (typeof MCP_SUPPORTED_PROTOCOL_VERSIONS)[number],
    )
  ) {
    return jsonRpcError(request, null, -32022, 'Unsupported protocol version', {
      status: 400,
      data: {
        supported: MCP_SUPPORTED_PROTOCOL_VERSIONS,
        requested: declaredProtocolVersion,
      },
    })
  }
  const requestProtocolVersion = declaredProtocolVersion || DEFAULT_PROTOCOL_VERSION

  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH) {
    return jsonRpcError(request, null, -32600, 'Request body is too large', {
      status: 413,
      protocolVersion: requestProtocolVersion,
    })
  }

  if (isRateLimited(getClientIp(request))) {
    const response = jsonRpcError(request, null, -32000, 'Too many requests', {
      status: 429,
      protocolVersion: requestProtocolVersion,
    })
    response.headers.set('Retry-After', '60')
    return response
  }

  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_LENGTH) {
    return jsonRpcError(request, null, -32600, 'Request body is too large', {
      status: 413,
      protocolVersion: requestProtocolVersion,
    })
  }

  let message: unknown
  try {
    message = JSON.parse(rawBody)
  } catch {
    return jsonRpcError(request, null, -32700, 'Parse error', {
      status: 400,
      protocolVersion: requestProtocolVersion,
    })
  }

  if (!isRecord(message) || message.jsonrpc !== '2.0') {
    return jsonRpcError(request, null, -32600, 'Invalid Request', {
      status: 400,
      protocolVersion: requestProtocolVersion,
    })
  }

  if (typeof message.method !== 'string') {
    if ('id' in message && ('result' in message || 'error' in message)) {
      return new Response(null, {
        status: 202,
        headers: responseHeaders(request, requestProtocolVersion),
      })
    }
    return jsonRpcError(request, null, -32600, 'Invalid Request', {
      status: 400,
      protocolVersion: requestProtocolVersion,
    })
  }

  const hasId = Object.hasOwn(message, 'id')
  const modern = requestProtocolVersion === MCP_PROTOCOL_VERSION
  const params = isRecord(message.params) ? message.params : null

  if (modern) {
    const metadata = params && isRecord(params._meta) ? params._meta : null
    const metadataProtocolVersion = metadata?.['io.modelcontextprotocol/protocolVersion']
    const clientCapabilities = metadata?.['io.modelcontextprotocol/clientCapabilities']

    if (typeof metadataProtocolVersion !== 'string' || !isRecord(clientCapabilities)) {
      return jsonRpcError(
        request,
        isValidId(message.id) ? message.id : null,
        -32602,
        'Invalid params',
        {
          status: 400,
          protocolVersion: requestProtocolVersion,
          data: {
            message:
              'Modern MCP requests require protocolVersion and clientCapabilities in params._meta',
          },
        },
      )
    }

    if (metadataProtocolVersion !== requestProtocolVersion) {
      return jsonRpcError(
        request,
        isValidId(message.id) ? message.id : null,
        -32020,
        'Header mismatch: MCP-Protocol-Version does not match params._meta',
        { status: 400, protocolVersion: requestProtocolVersion },
      )
    }

    const mirroredMethod = request.headers.get('mcp-method')
    if (mirroredMethod !== message.method) {
      return jsonRpcError(
        request,
        isValidId(message.id) ? message.id : null,
        -32020,
        'Header mismatch: Mcp-Method does not match the request method',
        { status: 400, protocolVersion: requestProtocolVersion },
      )
    }

    const nameKey = message.method === 'resources/read' ? 'uri' : 'name'
    const requiresName = ['tools/call', 'resources/read', 'prompts/get'].includes(message.method)
    if (requiresName) {
      const bodyName = params?.[nameKey]
      const headerName = decodeMirroredHeader(request.headers.get('mcp-name'))
      if (typeof bodyName !== 'string' || headerName !== bodyName) {
        return jsonRpcError(
          request,
          isValidId(message.id) ? message.id : null,
          -32020,
          'Header mismatch: Mcp-Name does not match the request name',
          { status: 400, protocolVersion: requestProtocolVersion },
        )
      }
    }
  }

  if (!hasId) {
    return new Response(null, {
      status: 202,
      headers: responseHeaders(request, requestProtocolVersion),
    })
  }
  if (!isValidId(message.id) || (modern && message.id === null)) {
    return jsonRpcError(request, null, -32600, 'Invalid Request', {
      status: 400,
      protocolVersion: requestProtocolVersion,
    })
  }

  const { id } = message
  try {
    const result = await handleMcpMethod(message.method, message.params ?? {}, {
      protocolVersion: requestProtocolVersion,
    })
    const protocolVersion =
      message.method === 'initialize' &&
      isRecord(result) &&
      typeof result.protocolVersion === 'string'
        ? result.protocolVersion
        : requestProtocolVersion

    return Response.json(
      { jsonrpc: '2.0', id, result },
      {
        headers: responseHeaders(request, protocolVersion),
      },
    )
  } catch (error) {
    if (error instanceof McpProtocolError) {
      return jsonRpcError(request, id, error.code, error.message, {
        data: error.data,
        status: modern && error.code === -32601 ? 404 : 200,
        protocolVersion: requestProtocolVersion,
      })
    }
    return jsonRpcError(request, id, -32603, 'Internal error', {
      protocolVersion: requestProtocolVersion,
    })
  }
}
