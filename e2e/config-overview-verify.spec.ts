import { test, expect } from '@playwright/test'

const SCREENSHOT_DIR = 'e2e/screenshots/config-overview'

test.describe('Configuration Overview Page Verification', () => {
  test('light mode - FileTree, Callout with Tabs, and Cards', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/docs/configuration')
    await page.waitForLoadState('networkidle')

    // Screenshot: full page light mode
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/light-full.png`,
      fullPage: true,
    })

    // 1. Verify FileTree is visible — check for expected items
    // Look for file tree items by text content
    await expect(page.getByText('.env').first()).toBeVisible()
    await expect(page.getByText('librechat.yaml').first()).toBeVisible()
    await expect(page.getByText('docker-compose.yml').first()).toBeVisible()
    await expect(page.getByText('docker-compose.override.yml').first()).toBeVisible()

    // Screenshot: FileTree area
    const fileTreeSection = page
      .locator('section, div')
      .filter({ hasText: 'LibreChat (project root)' })
      .first()
    if ((await fileTreeSection.count()) > 0) {
      await fileTreeSection.screenshot({ path: `${SCREENSHOT_DIR}/light-filetree.png` })
    }

    // 2. Verify Callout with restart instructions
    await expect(page.getByText('Restart Required')).toBeVisible()

    // Verify Docker tab content
    await expect(page.getByText('docker compose down')).toBeVisible()

    // Screenshot: Callout area
    const calloutSection = page.locator('div').filter({ hasText: 'Restart Required' }).first()
    if ((await calloutSection.count()) > 0) {
      await calloutSection.screenshot({ path: `${SCREENSHOT_DIR}/light-callout.png` })
    }

    // Click Local tab and verify local instructions
    const localTab = page
      .getByRole('tab', { name: 'Local' })
      .or(page.locator('button').filter({ hasText: 'Local' }))
    if ((await localTab.count()) > 0) {
      await localTab.first().click()
      await page.waitForTimeout(300)
      await expect(page.getByText('npm run backend')).toBeVisible()
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/light-local-tab.png`,
        fullPage: false,
      })
    }

    // 3. Verify Cards section with three links (use first() to avoid strict-mode collision with sidebar links)
    await expect(page.getByRole('link', { name: /librechat\.yaml setup/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /docker setup/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /\.env reference/i }).first()).toBeVisible()

    // Screenshot: Cards area
    const cardsSection = page.locator('div').filter({ hasText: 'Next Steps' }).last()
    if ((await cardsSection.count()) > 0) {
      await cardsSection.screenshot({ path: `${SCREENSHOT_DIR}/light-cards.png` })
    }
  })

  test('dark mode - FileTree, Callout with Tabs, and Cards', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/docs/configuration')
    await page.waitForLoadState('networkidle')

    // Screenshot: full page dark mode
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/dark-full.png`,
      fullPage: true,
    })

    // 1. Verify FileTree files visible in dark mode
    await expect(page.getByText('.env').first()).toBeVisible()
    await expect(page.getByText('librechat.yaml').first()).toBeVisible()
    await expect(page.getByText('docker-compose.yml').first()).toBeVisible()
    await expect(page.getByText('docker-compose.override.yml').first()).toBeVisible()

    // 2. Verify Callout
    await expect(page.getByText('Restart Required')).toBeVisible()
    await expect(page.getByText('docker compose down')).toBeVisible()

    // 3. Verify Cards
    await expect(page.getByRole('link', { name: /librechat\.yaml setup/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /docker setup/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /\.env reference/i }).first()).toBeVisible()

    // Click Local tab in dark mode
    const localTab = page
      .getByRole('tab', { name: 'Local' })
      .or(page.locator('button').filter({ hasText: 'Local' }))
    if ((await localTab.count()) > 0) {
      await localTab.first().click()
      await page.waitForTimeout(300)
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/dark-local-tab.png`,
        fullPage: false,
      })
    }
  })
})
