import { test, expect } from '@playwright/test'

test.describe('Custom endpoints quickstart page', () => {
  test('renders the callout, restart tabs, and cards', async ({ page }) => {
    await page.goto('/docs/quick_start/custom_endpoints')

    // "Which File Does What?" callout and the files it references.
    await expect(page.getByText('Which File Does What?').first()).toBeVisible()
    const main = page.locator('main')
    await expect(main).toContainText('librechat.yaml')
    await expect(main).toContainText('.env')
    await expect(main).toContainText('docker-compose.override.yml')

    // Docker / Local restart tabs.
    const dockerTab = page.getByRole('tab', { name: /docker/i }).first()
    const localTab = page.getByRole('tab', { name: /local/i }).first()
    await expect(dockerTab).toBeVisible()
    await expect(localTab).toBeVisible()

    // Tab switching updates the selected state.
    await localTab.click()
    await expect(localTab).toHaveAttribute('aria-selected', 'true')

    // Next-step cards.
    const cards = page.locator('a[class*="card"], a[class*="Card"], [class*="cards"] a')
    expect(await cards.count()).toBeGreaterThanOrEqual(1)
  })
})
