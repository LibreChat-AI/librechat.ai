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
    headers.set('Access-Control-Allow-Headers', 'Content-Type, MCP-Protocol-Version')
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
  if (accept && !accept.includes('application/json') && !accept.includes('*/*')) {
    return jsonRpcError(request, null, -32600, 'Accept must include application/json', {
      status: 406,
    })
  }

  const declaredProtocolVersion = request.headers.get('mcp-protocol-version')
  if (
    declaredProtocolVersion &&
    !MCP_SUPPORTED_PROTOCOL_VERSIONS.includes(
      declaredProtocolVersion as (typeof MCP_SUPPORTED_PROTOCOL_VERSIONS)[number],
    )
  ) {
    return jsonRpcError(request, null, -32600, 'Unsupported MCP protocol version', {
      status: 400,
      data: { supported: MCP_SUPPORTED_PROTOCOL_VERSIONS },
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
  if (!hasId) {
    return new Response(null, {
      status: 202,
      headers: responseHeaders(request, requestProtocolVersion),
    })
  }
  if (!isValidId(message.id)) {
    return jsonRpcError(request, null, -32600, 'Invalid Request', {
      status: 400,
      protocolVersion: requestProtocolVersion,
    })
  }

  const { id } = message
  try {
    const result = await handleMcpMethod(message.method, message.params ?? {})
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
        protocolVersion: requestProtocolVersion,
      })
    }
    return jsonRpcError(request, id, -32603, 'Internal error', {
      protocolVersion: requestProtocolVersion,
    })
  }
}
