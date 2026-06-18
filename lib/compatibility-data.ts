/**
 * Data for the model/endpoint compatibility matrix (rendered by
 * components/CompatibilityMatrix.tsx on /docs/compatibility).
 *
 * This is a manually-maintained quick reference. Edit the `matrix` below when
 * support changes and bump `LAST_REVIEWED`. Cells use coarse states so the
 * table stays honest: capabilities that depend on the chosen model are marked
 * "model" rather than a hard yes/no.
 */

export const LAST_REVIEWED = '2026-06-18'

export type Support = 'yes' | 'no' | 'model' | 'agents'

export const SUPPORT_LEGEND: Record<Support, { symbol: string; label: string }> = {
  yes: { symbol: '✓', label: 'Supported' },
  no: { symbol: '—', label: 'Not supported' },
  model: { symbol: '◐', label: 'Depends on the model' },
  agents: { symbol: '⚙', label: 'Via the Agents endpoint' },
}

export interface Endpoint {
  id: string
  name: string
  href?: string
}

export interface Capability {
  id: string
  name: string
  href?: string
}

/** Columns: LibreChat endpoint types. */
export const endpoints: Endpoint[] = [
  { id: 'openai', name: 'OpenAI', href: '/docs/configuration/pre_configured_ai/openai' },
  { id: 'azure', name: 'Azure OpenAI', href: '/docs/configuration/azure' },
  { id: 'anthropic', name: 'Anthropic', href: '/docs/configuration/pre_configured_ai/anthropic' },
  { id: 'google', name: 'Google', href: '/docs/configuration/pre_configured_ai/google' },
  { id: 'bedrock', name: 'AWS Bedrock', href: '/docs/configuration/pre_configured_ai/bedrock' },
  {
    id: 'custom',
    name: 'Custom (OpenAI-compatible)',
    href: '/docs/configuration/librechat_yaml/ai_endpoints',
  },
  { id: 'agents', name: 'Agents', href: '/docs/features/agents' },
  {
    id: 'assistants',
    name: 'Assistants',
    href: '/docs/configuration/pre_configured_ai/assistants',
  },
]

/** Rows: LibreChat capabilities. */
export const capabilities: Capability[] = [
  { id: 'streaming', name: 'Streaming responses' },
  { id: 'vision', name: 'Vision (image input)' },
  { id: 'tools', name: 'Tools / function calling' },
  { id: 'web_search', name: 'Web Search', href: '/docs/features/web_search' },
  { id: 'code_interpreter', name: 'Code Interpreter', href: '/docs/features/code_interpreter' },
  { id: 'artifacts', name: 'Artifacts', href: '/docs/features/artifacts' },
  { id: 'file_search', name: 'File Search (RAG)', href: '/docs/features/rag_api' },
  { id: 'image_gen', name: 'Image Generation', href: '/docs/features/image_gen' },
  { id: 'ocr', name: 'OCR', href: '/docs/features/ocr' },
  { id: 'memory', name: 'Memory', href: '/docs/features/memory' },
  { id: 'mcp', name: 'MCP', href: '/docs/features/mcp' },
]

/**
 * matrix[capabilityId][endpointId] = support state.
 * First-pass values — maintainers should verify against the current release.
 */
export const matrix: Record<string, Record<string, Support>> = {
  streaming: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'yes',
  },
  vision: {
    openai: 'model',
    azure: 'model',
    anthropic: 'model',
    google: 'model',
    bedrock: 'model',
    custom: 'model',
    agents: 'model',
    assistants: 'model',
  },
  tools: {
    openai: 'model',
    azure: 'model',
    anthropic: 'model',
    google: 'model',
    bedrock: 'model',
    custom: 'model',
    agents: 'yes',
    assistants: 'yes',
  },
  web_search: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'no',
  },
  code_interpreter: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'yes',
  },
  artifacts: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'no',
  },
  file_search: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'yes',
  },
  image_gen: {
    openai: 'agents',
    azure: 'agents',
    anthropic: 'agents',
    google: 'agents',
    bedrock: 'agents',
    custom: 'agents',
    agents: 'yes',
    assistants: 'agents',
  },
  ocr: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'yes',
  },
  memory: {
    openai: 'yes',
    azure: 'yes',
    anthropic: 'yes',
    google: 'yes',
    bedrock: 'yes',
    custom: 'yes',
    agents: 'yes',
    assistants: 'no',
  },
  mcp: {
    openai: 'agents',
    azure: 'agents',
    anthropic: 'agents',
    google: 'agents',
    bedrock: 'agents',
    custom: 'agents',
    agents: 'yes',
    assistants: 'no',
  },
}
