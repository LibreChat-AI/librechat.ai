import { test, expect } from '@playwright/test'

test.describe('Docker install page', () => {
  test('renders the heading and a Steps component', async ({ page }) => {
    await page.goto('/docs/local/docker')

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()

    // Fumadocs Steps component renders a container with a "steps" class.
    const steps = page.locator('div.steps, .fd-steps, ol.steps, [class*="steps"]')
    await expect(steps.first()).toBeVisible()
  })
})
