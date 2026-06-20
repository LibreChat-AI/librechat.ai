import { absoluteUrl, MARKDOWN_RESPONSE_HEADERS } from '@/lib/get-llm-text'

export const revalidate = false

const entries = [
  {
    title: 'Homepage',
    url: '/',
    description: 'LibreChat overview, feature highlights, project links, and top-level navigation.',
  },
  {
    title: 'Quick Start',
    url: '/docs/quick_start',
    description: 'Choose a setup path and get LibreChat running quickly.',
  },
  {
    title: 'Local Install',
    url: '/docs/local',
    description: 'Local Docker, npm, and Helm installation guides.',
  },
  {
    title: 'Remote Install',
    url: '/docs/remote',
    description: 'Remote hosting options, deployment tradeoffs, tunnels, and reverse proxies.',
  },
  {
    title: 'Configuration',
    url: '/docs/configuration',
    description: 'How .env, librechat.yaml, Docker overrides, and service settings fit together.',
  },
  {
    title: 'librechat.yaml',
    url: '/docs/configuration/librechat_yaml',
    description: 'Custom AI endpoints, model settings, interface options, and advanced features.',
  },
  {
    title: 'Agents',
    url: '/docs/features/agents',
    description:
      'Build and configure LibreChat agents with tools, files, actions, and capabilities.',
  },
  {
    title: 'MCP',
    url: '/docs/features/mcp',
    description: 'Model Context Protocol setup, server connections, OAuth, tools, and variables.',
  },
  {
    title: 'RAG',
    url: '/docs/features/rag_api',
    description: 'Chat with files, document indexing, retrieval, and RAG API behavior.',
  },
  {
    title: 'Auth',
    url: '/docs/configuration/authentication',
    description: 'Email, LDAP, SAML, and OAuth/OIDC authentication configuration.',
  },
  {
    title: 'Environment Variables',
    url: '/docs/configuration/dotenv',
    description: 'Complete .env reference for LibreChat server settings and integrations.',
  },
  {
    title: 'Changelog',
    url: '/changelog',
    description: 'Release notes and configuration changelog entries.',
  },
]

function docsMarkdownUrl(path: string): string | undefined {
  return path.startsWith('/docs') ? absoluteUrl(`${path}.md`) : undefined
}

function renderEntry(entry: (typeof entries)[number]) {
  const markdownUrl = docsMarkdownUrl(entry.url)
  const suffix = markdownUrl ? ` Markdown: ${markdownUrl}` : ''

  return `- [${entry.title}](${absoluteUrl(entry.url)}): ${entry.description}${suffix}`
}

export async function GET() {
  const body = `# LibreChat

> Curated map of the LibreChat documentation for language models and coding agents.

## Key Pages

${entries.map(renderEntry).join('\n')}

## Complete Documentation

- [Full documentation text](${absoluteUrl('/llms-full.txt')}): All docs pages concatenated as Markdown.
- Per-page Markdown: append \`.md\` to any docs page URL, for example ${absoluteUrl('/docs/configuration/librechat_yaml.md')}.
- Legacy per-page MDX URLs ending in \`.mdx\` remain supported for compatibility.
`

  return new Response(body, {
    headers: MARKDOWN_RESPONSE_HEADERS,
  })
}
