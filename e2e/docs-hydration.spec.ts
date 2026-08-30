import { expect, test, type Page } from '@playwright/test'

const hydrationError =
  /(?:Minified React error #418|Hydration failed|hydration mismatch|server rendered HTML didn't match|text content does not match server-rendered HTML)/i

function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = []

  page.on('pageerror', (error) => {
    if (hydrationError.test(error.message)) errors.push(error.message)
  })
  page.on('console', (message) => {
    if (message.type() === 'error' && hydrationError.test(message.text())) {
      errors.push(message.text())
    }
  })

  return errors
}

test.describe('docs hydration', () => {
  for (const path of ['/docs/quick_start', '/docs/local/docker', '/it/docs/translation'] as const) {
    test(`${path} hydrates with matching navigation state`, async ({ page }) => {
      const errors = collectHydrationErrors(page)

      await page.goto(path)
      await expect(page.locator('#nd-page')).toBeVisible()

      // The breadcrumb and active sidebar item both depend on usePathname().
      // Their post-hydration state therefore catches the original internal
      // /en/docs/* versus public /docs/* pathname mismatch directly.
      await expect(page.locator(`#nd-page > div:first-child a[href="${path}"]`)).toBeVisible()
      await expect(page.locator(`#nd-sidebar a[href="${path}"][data-active="true"]`)).toBeAttached()

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toBeTruthy()
      expect(new URL(canonical!, page.url()).pathname).toBe(path)
      expect(canonical).not.toContain('/en/docs')

      // x-default names the page to serve a reader whose language matches no
      // alternate. It must always be the English source, including on the
      // localized page in this list.
      const xDefault = await page
        .locator('link[rel="alternate"][hreflang="x-default"]')
        .getAttribute('href')
      expect(xDefault).toBeTruthy()
      expect(new URL(xDefault!, page.url()).pathname).toMatch(/^\/docs(?:\/|$)/)

      // Allow effects and queued console events to flush before checking.
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          }),
      )
      expect(errors).toEqual([])
    })
  }

  test('sitemap contains canonical English docs URLs only', async ({ request }) => {
    const indexResponse = await request.get('/sitemap.xml')
    expect(indexResponse.ok()).toBe(true)

    const documents = [await indexResponse.text()]
    const sitemapUrls = Array.from(
      documents[0].matchAll(/<loc>([^<]*\/sitemap-[^<]+\.xml)<\/loc>/g),
      (match) => match[1],
    )

    for (const url of sitemapUrls) {
      // The generated sitemap uses production absolute URLs. Keep the check on
      // the local production build instead of accidentally querying the live site.
      const response = await request.get(new URL(url).pathname)
      expect(response.ok()).toBe(true)
      documents.push(await response.text())
    }

    const sitemap = documents.join('\n')
    expect(sitemap).toContain('/docs/quick_start')
    expect(sitemap).not.toMatch(/\/en\/docs(?:\/|<)/)

    // Only pages a reader can land on. next-sitemap builds its URL set from
    // Next's prerender manifest, which lists statically rendered route handlers
    // alongside pages, so the raw-Markdown mirror and the agent-discovery
    // documents reach the sitemap unless excluded.
    for (const pattern of [
      /<loc>[^<]*\/toolkit(?:\/|<)/,
      /<loc>[^<]*\.mdx?<\/loc>/,
      /<loc>[^<]*\/llms(?:\.|-)/,
      /<loc>[^<]*\/openapi\.json</,
      /<loc>[^<]*\/\.well-known\//,
    ]) {
      expect(sitemap, `sitemap should not list ${pattern}`).not.toMatch(pattern)
    }

    // Google ignores both, and every URL carried the same pair of values.
    expect(sitemap).not.toContain('<changefreq>')
    expect(sitemap).not.toContain('<priority>')

    // Every lastmod must be a real commit or publication date. The bug this
    // replaces stamped build time on all ~2,700 URLs, so anything from the last
    // hour means the synthesized value is back.
    const anHourAgo = Date.now() - 60 * 60 * 1000
    const lastmods = Array.from(sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), (m) => m[1])
    for (const lastmod of lastmods) {
      expect(Number.isNaN(Date.parse(lastmod)), `unparseable lastmod ${lastmod}`).toBe(false)
      expect(Date.parse(lastmod), `lastmod ${lastmod} looks like build time`).toBeLessThan(
        anHourAgo,
      )
    }
  })
})

test.describe('indexing directives', () => {
  test('moved docs URLs redirect permanently to their new home', async ({ request }) => {
    const response = await request.get('/docs/user_guides/artifacts', { maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(new URL(response.headers().location, 'http://localhost').pathname).toBe(
      '/docs/features/artifacts',
    )
  })

  test('toolkit aliases reach their docs page in a single permanent hop', async ({ request }) => {
    const response = await request.get('/toolkit/yaml_checker', { maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(new URL(response.headers().location, 'http://localhost').pathname).toBe(
      '/docs/toolkit/yaml-validator',
    )
  })

  test('the markdown surface is served but not indexable', async ({ request }) => {
    for (const path of ['/llms.txt', '/docs/quick_start.md']) {
      const response = await request.get(path)
      expect(response.ok(), `${path} should still be served`).toBe(true)
      expect(response.headers()['x-robots-tag'], `${path} should be noindex`).toContain('noindex')
    }
  })

  test('the docs page itself stays indexable', async ({ request }) => {
    const response = await request.get('/docs/quick_start')

    expect(response.ok()).toBe(true)
    expect(response.headers()['x-robots-tag']).toBeUndefined()
  })
})
