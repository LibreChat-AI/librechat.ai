import { test, expect } from '@playwright/test'

test.describe('Configuration overview page', () => {
  test('renders the file tree, restart callout, tabs, and cards', async ({ page }) => {
    await page.goto('/docs/configuration')

    // FileTree entries.
    await expect(page.getByText('.env').first()).toBeVisible()
    await expect(page.getByText('librechat.yaml').first()).toBeVisible()
    await expect(page.getByText('docker-compose.yml').first()).toBeVisible()
    await expect(page.getByText('docker-compose.override.yml').first()).toBeVisible()

    // Restart callout, with the default (Docker) tab content.
    await expect(page.getByText('Restart Required').first()).toBeVisible()
    await expect(page.getByText('docker compose down').first()).toBeVisible()

    // Switching to the Local tab reveals its instructions.
    await page.getByRole('tab', { name: 'Local' }).first().click()
    await expect(page.getByText('npm run backend').first()).toBeVisible()

    // "Next Steps" cards.
    await expect(page.getByRole('link', { name: /librechat\.yaml setup/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /docker setup/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /\.env reference/i }).first()).toBeVisible()
  })
})
