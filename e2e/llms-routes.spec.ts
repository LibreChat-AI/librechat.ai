import { expect, test } from '@playwright/test'

test.describe('LLM markdown routes', () => {
  test('serves the curated LLM index as markdown', async ({ request }) => {
    const response = await request.get('/llms.txt')

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    await expect(response.text()).resolves.toContain('Full documentation text')
  })

  test('serves the full docs export as markdown', async ({ request }) => {
    const response = await request.get('/llms-full.txt')

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    await expect(response.text()).resolves.toContain(
      '# Custom Config (https://www.librechat.ai/docs/configuration/librechat_yaml)',
    )
  })

  test('rewrites the docs index .md URL to markdown', async ({ request }) => {
    const response = await request.get('/docs.md')

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    await expect(response.text()).resolves.toContain(
      '# Documentation (https://www.librechat.ai/docs)',
    )
  })

  test('rewrites .md docs URLs to per-page markdown', async ({ request }) => {
    const response = await request.get('/docs/configuration/librechat_yaml.md')

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    await expect(response.text()).resolves.toContain(
      '# Custom Config (https://www.librechat.ai/docs/configuration/librechat_yaml)',
    )
  })

  test('keeps legacy .mdx docs URLs working', async ({ request }) => {
    const response = await request.get('/docs/configuration/librechat_yaml.mdx')

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    await expect(response.text()).resolves.toContain(
      '# Custom Config (https://www.librechat.ai/docs/configuration/librechat_yaml)',
    )
  })
})
