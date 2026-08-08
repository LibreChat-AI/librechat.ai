import { describe, expect, it } from 'vitest'
import packageJson from '@/package.json'
import { GET } from '../route'

describe('GET /.well-known/agent-card.json', () => {
  it('returns a discoverable A2A Agent Card', async () => {
    const response = await GET()
    const card = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('application/json')
    expect(card).toMatchObject({
      name: 'LibreChat Documentation Agent',
      version: packageJson.version,
      description: expect.stringMatching(/\S/),
      supportedInterfaces: [
        {
          url: 'https://www.librechat.ai/api/chat',
          protocolBinding: 'HTTP+JSON',
          protocolVersion: '1.0',
        },
      ],
      capabilities: {
        streaming: true,
        pushNotifications: false,
        extendedAgentCard: false,
      },
      defaultInputModes: ['application/json', 'text/plain'],
      defaultOutputModes: ['text/plain', 'application/json'],
    })

    expect(card.skills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'search-documentation',
          name: expect.stringMatching(/\S/),
          description: expect.stringMatching(/\S/),
        }),
        expect.objectContaining({
          id: 'navigate-documentation',
          name: expect.stringMatching(/\S/),
          description: expect.stringMatching(/\S/),
        }),
      ]),
    )
  })
})
