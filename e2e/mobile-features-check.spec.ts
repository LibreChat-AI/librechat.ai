import { test, expect } from '@playwright/test'

test.describe('Features page — mobile layout', () => {
  test.use({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })

  test('does not overflow horizontally on a phone viewport', async ({ page }) => {
    await page.goto('/docs/features')

    // Wait for the page to actually render before measuring layout.
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }))

    // Allow 1px for sub-pixel rounding.
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1)
  })
})
