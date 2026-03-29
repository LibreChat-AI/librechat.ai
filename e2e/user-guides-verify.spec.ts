import { test, expect } from '@playwright/test'

const SHOTS = 'test-results'

test.describe('user_guides page verification', () => {
  test('light mode - verify sections and cards', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/docs/user_guides', { waitUntil: 'networkidle' })

    await page.waitForSelector('main', { timeout: 15000 })

    await page.screenshot({
      path: `${SHOTS}/user-guides-light.png`,
      fullPage: true,
    })

    console.log('Light mode screenshot saved to:', `${SHOTS}/user-guides-light.png`)

    const pageText = await page.locator('main').innerText()
    console.log('Page text snippet:', pageText.slice(0, 800))

    const guidesHeading = page.getByText('Guides', { exact: true })
    const guidesCount = await guidesHeading.count()
    console.log('Exact "Guides" heading count:', guidesCount)

    const popularFeaturesHeading = page.getByText('Popular Features', { exact: true })
    const popularCount = await popularFeaturesHeading.count()
    console.log('Exact "Popular Features" heading count:', popularCount)

    const aiOverviewLink = page.getByRole('link', { name: /ai overview/i })
    const presetsLink = page.getByRole('link', { name: /presets/i })
    const mongoDBLink = page.getByRole('link', { name: /mongodb/i })
    const agentsLink = page.getByRole('link', { name: /agents/i })
    const imageGenLink = page.getByRole('link', { name: /image gen/i })
    const webSearchLink = page.getByRole('link', { name: /web search/i })
    const mcpLink = page.getByRole('link', { name: /mcp/i })

    console.log('AI Overview links:', await aiOverviewLink.count())
    console.log('Presets links:', await presetsLink.count())
    console.log('MongoDB links:', await mongoDBLink.count())
    console.log('Agents links:', await agentsLink.count())
    console.log('Image Gen links:', await imageGenLink.count())
    console.log('Web Search links:', await webSearchLink.count())
    console.log('MCP links:', await mcpLink.count())

    const images = page.locator('main img')
    const imgCount = await images.count()
    console.log('Images in main content:', imgCount)
    for (let i = 0; i < imgCount; i++) {
      const src = await images.nth(i).getAttribute('src')
      const alt = await images.nth(i).getAttribute('alt')
      console.log(`  Image ${i}: src=${src}, alt=${alt}`)
    }
  })

  test('dark mode - verify sections and cards', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/docs/user_guides', { waitUntil: 'networkidle' })

    await page.waitForSelector('main', { timeout: 15000 })

    await page.screenshot({
      path: `${SHOTS}/user-guides-dark.png`,
      fullPage: true,
    })

    // Verify key content renders in dark mode
    await expect(page.getByRole('heading', { name: /overview/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /ai overview/i }).first()).toBeVisible()
  })
})
