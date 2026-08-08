import { NextResponse } from 'next/server'
import packageJson from '@/package.json'
import { absoluteUrl, SITE_URL } from '@/lib/structured-data'

export const revalidate = 86400

const agentCard = {
  name: 'LibreChat Documentation Agent',
  description:
    'Answers questions about LibreChat by searching its documentation and directing users to relevant pages.',
  supportedInterfaces: [
    {
      url: absoluteUrl('/api/chat'),
      protocolBinding: 'HTTP+JSON',
      protocolVersion: '1.0',
    },
  ],
  provider: {
    organization: 'LibreChat',
    url: SITE_URL,
  },
  version: packageJson.version,
  documentationUrl: absoluteUrl('/docs'),
  iconUrl: absoluteUrl('/android-chrome-512x512.png'),
  capabilities: {
    streaming: true,
    pushNotifications: false,
    extendedAgentCard: false,
  },
  defaultInputModes: ['application/json', 'text/plain'],
  defaultOutputModes: ['text/plain', 'application/json'],
  skills: [
    {
      id: 'search-documentation',
      name: 'Search LibreChat Documentation',
      description:
        'Searches LibreChat documentation and returns concise answers with links to relevant pages.',
      tags: ['librechat', 'documentation', 'search', 'support'],
      examples: [
        'How do I install LibreChat with Docker?',
        'Which environment variables configure authentication?',
      ],
    },
    {
      id: 'navigate-documentation',
      name: 'Navigate LibreChat Documentation',
      description:
        'Finds the most relevant LibreChat documentation page for a requested topic and provides its URL.',
      tags: ['librechat', 'documentation', 'navigation'],
      examples: ['Take me to the MCP setup guide.', 'Where is the librechat.yaml reference?'],
    },
  ],
} as const

export async function GET() {
  return NextResponse.json(agentCard, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      ETag: `"${packageJson.version}"`,
    },
  })
}
