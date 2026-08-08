import { MCP_SERVER_CARD } from '@/lib/mcp-server-metadata'

export const revalidate = false

export function GET() {
  return Response.json(MCP_SERVER_CARD, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
