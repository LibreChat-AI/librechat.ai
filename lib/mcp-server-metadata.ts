import packageJson from '@/package.json'
import { absoluteUrl } from '@/lib/structured-data'

export const MCP_PROTOCOL_VERSION = '2025-06-18'
export const MCP_SUPPORTED_PROTOCOL_VERSIONS = [MCP_PROTOCOL_VERSION, '2025-03-26'] as const

export const MCP_SERVER_INFO = {
  name: 'librechat-docs',
  title: 'LibreChat Documentation',
  version: packageJson.version,
} as const

export const MCP_SERVER_CAPABILITIES = {
  tools: {},
  resources: {},
  prompts: {},
} as const

export const MCP_SERVER_CARD = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
  version: '1.0',
  protocolVersion: MCP_PROTOCOL_VERSION,
  serverInfo: MCP_SERVER_INFO,
  description: 'Search and navigate the LibreChat documentation.',
  iconUrl: absoluteUrl('/android-chrome-512x512.png'),
  documentationUrl: absoluteUrl('/docs'),
  transport: {
    type: 'streamable-http',
    endpoint: '/mcp',
  },
  capabilities: MCP_SERVER_CAPABILITIES,
  tools: ['dynamic'],
  resources: ['dynamic'],
  prompts: ['dynamic'],
} as const
