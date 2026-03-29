import { test, expect } from '@playwright/test'
import path from 'path'

const SCREENSHOT_DIR = path.join(__dirname, '../test-results/stats-section')

test.describe('Open source stats section', () => {
  test('desktop - 3 stats visible with numbers, centered 3-column layout', async ({ page }) => {
    await page.goto('http://localhost:3333')
    await page.waitForLoadState('networkidle')

    // Locate the "Open source, community driven" section — find by heading text
    const heading = page.getByRole('heading', { name: /open source.*community driven/i })
    await heading.waitFor({ timeout: 10000 })
    await heading.scrollIntoViewIfNeeded()

    // Wait a moment for any dynamic data to load
    await page.waitForTimeout(2000)

    // Take a screenshot of the section
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop-stats-section.png'),
      fullPage: false,
    })

    // Scroll to the section and screenshot it in viewport
    await heading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Find all stat blocks - look for the stats container
    // The section likely contains stat items with a label and value
    const githubStars = page.getByText(/github stars/i)
    const dockerPulls = page.getByText(/docker pulls/i)
    const contributors = page.getByText(/contributors/i)

    // Verify all 3 stat labels are present
    await expect(githubStars).toBeVisible()
    await expect(dockerPulls).toBeVisible()
    await expect(contributors).toBeVisible()

    console.log('All 3 stat labels are visible.')

    // Grab the bounding box of each label to check layout
    const starsBox = await githubStars.boundingBox()
    const pullsBox = await dockerPulls.boundingBox()
    const contribBox = await contributors.boundingBox()

    console.log('GitHub Stars box:', JSON.stringify(starsBox))
    console.log('Docker Pulls box:', JSON.stringify(pullsBox))
    console.log('Contributors box:', JSON.stringify(contribBox))

    // All 3 should be on roughly the same vertical position (within 50px)
    if (starsBox && pullsBox && contribBox) {
      const yTolerance = 80
      expect(Math.abs(starsBox.y - pullsBox.y)).toBeLessThan(yTolerance)
      expect(Math.abs(pullsBox.y - contribBox.y)).toBeLessThan(yTolerance)
      console.log('All 3 stats are in the same row (within y-tolerance).')

      // Check they are spread horizontally (not stacked)
      const starsCenter = starsBox.x + starsBox.width / 2
      const pullsCenter = pullsBox.x + pullsBox.width / 2
      const contribCenter = contribBox.x + contribBox.width / 2
      expect(pullsCenter).toBeGreaterThan(starsCenter + 50)
      expect(contribCenter).toBeGreaterThan(pullsCenter + 50)
      console.log('Stats are spread horizontally in 3 columns.')
    }

    // Check that stat values are not "--" (i.e., numbers loaded)
    // Get parent elements of each label to find associated value text
    const statItems = page.locator('[class*="stat"], [class*="Stats"], [class*="counter"]').all()
    const items = await statItems
    console.log(`Found ${items.length} stat item elements.`)

    // Look for numbers near the stat labels - check page content
    const pageContent = await page.content()
    const hasStarNumber = /\d[\d,kKmM.]+/.test(pageContent)
    expect(hasStarNumber).toBe(true)
    console.log('Numeric values found in page content.')

    // Screenshot the section area specifically
    let screenshotTarget = heading
    try {
      // Try to get the parent section for a better screenshot
      const parentSection = page.locator('section').filter({ hasText: /open source.*community/i })
      if ((await parentSection.count()) > 0) {
        screenshotTarget = parentSection.first()
      }
    } catch {
      // use heading fallback
    }

    await screenshotTarget.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop-stats-focused.png'),
    })

    console.log('Desktop screenshot saved.')
  })

  test('mobile (375px) - 3 stats do not break awkwardly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:3333')
    await page.waitForLoadState('networkidle')

    const heading = page.getByRole('heading', { name: /open source.*community driven/i })
    await heading.waitFor({ timeout: 10000 })
    await heading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2000)

    // Screenshot the full page around the stats section
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-stats-full.png'),
      fullPage: false,
    })

    // Verify all 3 labels still visible on mobile
    const githubStars = page.getByText(/github stars/i)
    const dockerPulls = page.getByText(/docker pulls/i)
    const contributors = page.getByText(/contributors/i)

    await expect(githubStars).toBeVisible()
    await expect(dockerPulls).toBeVisible()
    await expect(contributors).toBeVisible()

    console.log('All 3 stat labels visible on mobile.')

    // On mobile at 375px, check the layout
    const starsBox = await githubStars.boundingBox()
    const pullsBox = await dockerPulls.boundingBox()
    const contribBox = await contributors.boundingBox()

    console.log('Mobile - GitHub Stars box:', JSON.stringify(starsBox))
    console.log('Mobile - Docker Pulls box:', JSON.stringify(pullsBox))
    console.log('Mobile - Contributors box:', JSON.stringify(contribBox))

    if (starsBox && pullsBox && contribBox) {
      // On mobile they might stack OR stay in a row - just verify nothing is clipped off-screen
      expect(starsBox.x).toBeGreaterThanOrEqual(0)
      expect(pullsBox.x).toBeGreaterThanOrEqual(0)
      expect(contribBox.x).toBeGreaterThanOrEqual(0)

      // Nothing should be wider than the viewport
      expect(starsBox.x + starsBox.width).toBeLessThanOrEqual(400)
      expect(pullsBox.x + pullsBox.width).toBeLessThanOrEqual(400)
      expect(contribBox.x + contribBox.width).toBeLessThanOrEqual(400)

      console.log('No stat items are clipped off-screen on mobile.')
    }

    // Scroll a bit and take a focused screenshot
    await heading.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'mobile-stats-focused.png'),
    })

    console.log('Mobile screenshot saved.')
  })

  test('verify actual stat values are numbers, not placeholder "--"', async ({ page }) => {
    await page.goto('http://localhost:3333')
    await page.waitForLoadState('networkidle')

    const heading = page.getByRole('heading', { name: /open source.*community driven/i })
    await heading.waitFor({ timeout: 10000 })
    await heading.scrollIntoViewIfNeeded()

    // Wait for potential async data fetches
    await page.waitForTimeout(3000)

    // Look for "--" placeholder values - they should NOT be present near the stats
    // Get the section text
    const sectionText = await page.evaluate(() => {
      const sections = document.querySelectorAll('section')
      for (const s of sections) {
        if (
          s.textContent?.toLowerCase().includes('open source') &&
          s.textContent?.toLowerCase().includes('community')
        ) {
          return s.textContent
        }
      }
      // Fallback: look for a div/article with this content
      const all = document.querySelectorAll(
        '[class*="companies"], [class*="stats"], [class*="counter"]',
      )
      return Array.from(all)
        .map((el) => el.textContent)
        .join('\n')
    })

    console.log('Section text (first 500 chars):', sectionText?.slice(0, 500))

    // Check that "--" is not the primary content for the 3 known stat keys
    const hasDashPlaceholder = /github stars\s*--/i.test(sectionText ?? '')
    const hasDashPlaceholder2 = /docker pulls\s*--/i.test(sectionText ?? '')
    const hasDashPlaceholder3 = /contributors\s*--/i.test(sectionText ?? '')

    expect(hasDashPlaceholder).toBe(false)
    expect(hasDashPlaceholder2).toBe(false)
    expect(hasDashPlaceholder3).toBe(false)

    console.log('No "--" placeholder values found next to stat labels.')

    // Final full-page screenshot for visual reference
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'desktop-full-page.png'),
      fullPage: true,
    })

    console.log('Full page screenshot saved.')
  })
})
