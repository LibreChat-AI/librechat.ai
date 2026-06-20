import { test, expect } from '@playwright/test'

const PAGES = ['/', '/docs/configuration']

test.describe('Color scheme', () => {
  for (const path of PAGES) {
    test(`renders in dark mode at ${path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto(path)

      // next-themes (via Fumadocs RootProvider) applies the `dark` class once hydrated.
      await expect(page.locator('html')).toHaveClass(/dark/)
      await expect(page.getByRole('heading').first()).toBeVisible()
    })

    test(`renders in light mode at ${path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })
      await page.goto(path)

      await expect(page.locator('html')).not.toHaveClass(/dark/)
      await expect(page.getByRole('heading').first()).toBeVisible()
    })
  }
})
