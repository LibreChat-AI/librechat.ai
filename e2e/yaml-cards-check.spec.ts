import { test, expect } from '@playwright/test'

test.describe('librechat.yaml configuration page', () => {
  test('renders the Reference section with card links', async ({ page }) => {
    await page.goto('/docs/configuration/librechat_yaml')

    await expect(page.getByRole('heading', { name: 'Reference' }).first()).toBeVisible()

    const cards = page.locator('a').filter({ hasText: /AI Endpoints|Object Structure/i })
    expect(await cards.count()).toBeGreaterThan(0)
  })
})
