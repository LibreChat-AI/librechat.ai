import { test, expect } from '@playwright/test'

const PAGE_URL = '/docs/quick_start/custom_endpoints'

test.describe('custom_endpoints page verification', () => {
  test('light mode - callout, tabs, and cards', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' })

    // Full-page screenshot (saved by Playwright to test-results/<test-name>/)
    await page.screenshot({ path: 'test-results/custom-endpoints-light-full.png', fullPage: true })

    // 1. "Which File Does What?" callout
    const callout = page.locator('text=Which File Does What?')
    await expect(callout).toBeVisible()

    // All three files named in the callout section
    const pageContent = await page.content()
    expect(pageContent).toContain('librechat.yaml')
    expect(pageContent).toContain('.env')
    expect(pageContent).toContain('docker-compose.override.yml')

    // 2. Docker / Local restart Tabs
    const dockerTab = page.locator('[role="tab"]', { hasText: /docker/i }).first()
    const localTab = page.locator('[role="tab"]', { hasText: /local/i }).first()
    await expect(dockerTab).toBeVisible()
    await expect(localTab).toBeVisible()

    await dockerTab.scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/custom-endpoints-light-tabs.png' })

    // 3. Cards / Next Steps
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)

    const cards = page.locator('a[class*="card"], a[class*="Card"], [class*="cards"] a')
    const cardCount = await cards.count()
    console.log(`Light mode cards found: ${cardCount}`)
    expect(cardCount).toBeGreaterThanOrEqual(1)

    await page.screenshot({ path: 'test-results/custom-endpoints-light-bottom.png' })
  })

  test('dark mode - callout, tabs, and cards', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' })

    await page.screenshot({ path: 'test-results/custom-endpoints-dark-full.png', fullPage: true })

    // 1. Callout
    const callout = page.locator('text=Which File Does What?')
    await expect(callout).toBeVisible()

    const pageContent = await page.content()
    expect(pageContent).toContain('librechat.yaml')
    expect(pageContent).toContain('.env')
    expect(pageContent).toContain('docker-compose.override.yml')

    // 2. Tabs
    const dockerTab = page.locator('[role="tab"]', { hasText: /docker/i }).first()
    const localTab = page.locator('[role="tab"]', { hasText: /local/i }).first()
    await expect(dockerTab).toBeVisible()
    await expect(localTab).toBeVisible()

    await dockerTab.scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/custom-endpoints-dark-tabs.png' })

    // 3. Cards
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)

    const cards = page.locator('a[class*="card"], a[class*="Card"], [class*="cards"] a')
    const cardCount = await cards.count()
    console.log(`Dark mode cards found: ${cardCount}`)
    expect(cardCount).toBeGreaterThanOrEqual(1)

    await page.screenshot({ path: 'test-results/custom-endpoints-dark-bottom.png' })
  })

  test('tab switching works correctly', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(PAGE_URL, { waitUntil: 'networkidle' })

    const dockerTab = page.locator('[role="tab"]', { hasText: /docker/i }).first()
    const localTab = page.locator('[role="tab"]', { hasText: /local/i }).first()

    await dockerTab.scrollIntoViewIfNeeded()
    await dockerTab.click()
    await page.screenshot({ path: 'test-results/custom-endpoints-tab-docker.png' })

    await localTab.click()
    await page.waitForTimeout(200)
    await page.screenshot({ path: 'test-results/custom-endpoints-tab-local.png' })

    // After clicking Local, the Docker tab panel content should be hidden
    await expect(localTab).toHaveAttribute('aria-selected', 'true')
  })
})
