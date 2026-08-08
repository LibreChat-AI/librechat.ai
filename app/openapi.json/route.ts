const OPENAPI_MEDIA_TYPE = 'application/vnd.oai.openapi+json;version=3.1'

const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'LibreChat Documentation Assistant API',
    version: '1.0.0',
    description: 'Answers questions using the public LibreChat documentation.',
  },
  servers: [{ url: 'https://www.librechat.ai' }],
  paths: {
    '/api/chat': {
      post: {
        operationId: 'askDocumentationAssistant',
        summary: 'Ask the LibreChat documentation assistant',
        description:
          'Streams an answer grounded in the LibreChat documentation. Requests are rate limited.',
        parameters: [
          {
            name: 'x-chat-mode',
            in: 'header',
            required: false,
            schema: { type: 'string', enum: ['search', 'page'] },
            description: 'Selects general documentation search or a specific documentation page.',
          },
          {
            name: 'x-chat-page',
            in: 'header',
            required: false,
            schema: { type: 'string', pattern: '^/docs/' },
            description: 'Documentation path used when x-chat-mode is page.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['messages'],
                properties: {
                  messages: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'object', additionalProperties: true },
                  },
                },
                additionalProperties: false,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'A streamed documentation-assistant response.',
            content: {
              'text/event-stream': {
                schema: { type: 'string' },
              },
            },
          },
          '429': {
            description: 'The request exceeded the rate limit.',
          },
          '503': {
            description: 'The documentation assistant is not configured.',
          },
        },
      },
    },
  },
}

export const revalidate = false

export function GET() {
  return new Response(JSON.stringify(openApiDocument), {
    status: 200,
    headers: {
      'Content-Type': OPENAPI_MEDIA_TYPE,
    },
  })
}
