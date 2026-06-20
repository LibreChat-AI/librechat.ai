import { test, expect } from '@playwright/test'

test.describe('User guides overview page', () => {
  test('renders the overview heading and guide links', async ({ page }) => {
    await page.goto('/docs/user_guides')

    await expect(page.getByRole('heading', { name: /overview/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /ai overview/i }).first()).toBeVisible()
  })
})
