import { test, expect } from '@playwright/test'

test.describe('Google Search tool page', () => {
  test('uses agent terminology and disambiguates from Web Search', async ({ page }) => {
    await page.goto('/docs/configuration/tools/google_search')

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()

    const main = page.locator('main')
    // Disambiguates from the separate "Web Search" feature.
    await expect(main).toContainText(/web search/i)
    // Uses current "agent" terminology, not the deprecated plugins endpoint.
    await expect(main).toContainText(/agent/i)
    await expect(main).not.toContainText(/plugins endpoint/i)
  })
})
