import { expect, test } from '@playwright/test'

test.describe('Markdown content negotiation', () => {
  test('serves HTML from the homepage by default', async ({ request }) => {
    const response = await request.get('/', {
      headers: { 'Accept-Language': 'en' },
    })

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/html')
    expect(response.headers().vary).toContain('Accept')
  })

  test('serves the curated Markdown representation when requested', async ({ request }) => {
    const response = await request.get('/', {
      headers: {
        Accept: 'text/markdown',
        'Accept-Language': 'en',
      },
      timeout: 60_000,
    })

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    expect(response.headers().vary).toContain('Accept')
    await expect(response.text()).resolves.toContain('# LibreChat')
  })
})
