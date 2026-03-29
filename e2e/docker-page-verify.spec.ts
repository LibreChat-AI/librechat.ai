import { test, expect } from '@playwright/test'

test.describe('Docker page verification', () => {
  test('light mode - full page screenshot and content checks', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/docs/local/docker', { waitUntil: 'networkidle' })

    // Full page screenshot
    await page.screenshot({
      path: 'test-results/docker-light-full.png',
      fullPage: true,
    })

    // Top viewport
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: 'test-results/docker-light-top.png' })

    // Middle
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.screenshot({ path: 'test-results/docker-light-middle.png' })

    // Bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.screenshot({ path: 'test-results/docker-light-bottom.png' })

    // Content checks — verify steps component is present
    // 1. Steps component
    const stepsLocator = page.locator('div.steps, .fd-steps, ol.steps, [class*="steps"]')
    const stepsCount = await stepsLocator.count()
    console.log('Steps components found:', stepsCount)
    expect(stepsCount).toBeGreaterThan(0)

    // 2. First login / admin section
    const adminHeadings = page
      .locator('h2, h3')
      .filter({ hasText: /admin|first.?login|first.?account|verify.*log/i })
    console.log('Admin/First Login headings:', await adminHeadings.count())

    // 3. librechat.yaml mounting
    const yamlHeadings = page.locator('h2, h3').filter({ hasText: /librechat\.yaml|mount/i })
    console.log('YAML mounting headings:', await yamlHeadings.count())

    // 4. Troubleshooting
    const troubleHeadings = page.locator('h2, h3').filter({ hasText: /troubleshoot/i })
    console.log('Troubleshooting headings:', await troubleHeadings.count())

    const portHeadings = page.locator('h2, h3, h4').filter({ hasText: /port/i })
    console.log('Port conflict headings:', await portHeadings.count())

    const crashHeadings = page.locator('h2, h3, h4').filter({ hasText: /crash/i })
    console.log('Container crash headings:', await crashHeadings.count())

    const envHeadings = page.locator('h2, h3, h4').filter({ hasText: /env|environment/i })
    console.log('Env var headings:', await envHeadings.count())

    const allHeadings = await page.locator('h1, h2, h3, h4').allTextContents()
    console.log('All headings:', JSON.stringify(allHeadings))
  })

  test('dark mode - screenshots', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/docs/local/docker', { waitUntil: 'networkidle' })

    await page.screenshot({
      path: 'test-results/docker-dark-full.png',
      fullPage: true,
    })

    // Verify key content renders in dark mode
    await expect(page.locator('h1').first()).toBeVisible()
    const stepsLocator = page.locator('div.steps, .fd-steps, ol.steps, [class*="steps"]')
    expect(await stepsLocator.count()).toBeGreaterThan(0)
  })
})
