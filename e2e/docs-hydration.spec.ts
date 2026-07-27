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
  })
})
