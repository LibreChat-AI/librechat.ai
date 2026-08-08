import packageJson from '@/package.json'

export const MCP_PROTOCOL_VERSION = '2026-07-28'
export const MCP_LEGACY_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26'] as const
export const MCP_SUPPORTED_PROTOCOL_VERSIONS = [
  MCP_PROTOCOL_VERSION,
  ...MCP_LEGACY_PROTOCOL_VERSIONS,
] as const

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
