import { expect, test } from '@playwright/test'

test.describe('LLM markdown routes', () => {
  test('advertises agent discovery resources from the homepage', async ({ request }) => {
    const response = await request.head('/', {
      headers: { 'Accept-Language': 'en' },
    })

    expect(response.ok()).toBe(true)
    const { link } = response.headers()
    expect(link).toContain('</.well-known/api-catalog>; rel="api-catalog"')
    expect(link).toContain('</openapi.json>; rel="service-desc"')
    expect(link).toContain('</docs>; rel="service-doc"')
    expect(link).toContain('</llms.txt>; rel="describedby"')
  })

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

  test('serves .md URLs even when the client also negotiates for markdown', async ({ request }) => {
    // The .md suffix bypass must win over Accept-based negotiation, otherwise the
    // slug keeps its .md suffix and the page lookup 404s.
    const response = await request.get('/docs/configuration/librechat_yaml.md', {
      headers: { Accept: 'text/markdown' },
    })

    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).toContain('text/markdown')
    await expect(response.text()).resolves.toContain(
      '# Custom Config (https://www.librechat.ai/docs/configuration/librechat_yaml)',
    )
  })
})
