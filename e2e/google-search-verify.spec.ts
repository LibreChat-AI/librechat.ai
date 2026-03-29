import { test, expect } from '@playwright/test'
import path from 'path'

const URL = 'http://localhost:3333/docs/configuration/tools/google_search'
const SCREENSHOT_DIR = 'test-results/google-search-verify'

test.describe('Google Search page verification', () => {
  test('light mode - full page audit', async ({ page }) => {
    // Use light color scheme
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto(URL, { waitUntil: 'networkidle' })

    // Wait for main content to load
    await page.waitForSelector('main', { timeout: 15000 })

    // --- Full page screenshot ---
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'light-full-page.png'),
      fullPage: true,
    })

    // --- 1. Steps component with 6 steps ---
    const stepsLocator = page.locator('[data-steps], ol[class*="step"], .steps, [class*="Steps"]')
    const stepsCount = await stepsLocator.count()
    console.log(`Steps containers found: ${stepsCount}`)

    // Count individual step items (li inside steps, or elements with step data attrs)
    const stepItems = page.locator('[data-step], li[class*="step"], .steps li, ol.steps > li')
    const stepItemCount = await stepItems.count()
    console.log(`Step items found: ${stepItemCount}`)

    // Also check headings that might indicate steps
    const allHeadings = await page.locator('h2, h3').allTextContents()
    console.log('All headings:', allHeadings)

    // --- 2. Info Callout ---
    const callouts = page.locator(
      '[data-callout], .callout, [class*="callout"], aside[class*="info"], [role="note"]',
    )
    const calloutCount = await callouts.count()
    console.log(`Callout containers found: ${calloutCount}`)

    const calloutTexts = await callouts.allTextContents()
    console.log(
      'Callout texts:',
      calloutTexts.map((t) => t.slice(0, 100)),
    )

    // Check for disambiguation text about Web Search
    const pageText = await page.textContent('body')
    const hasWebSearchDisambiguation = pageText?.includes('Web Search') || false
    expect(hasWebSearchDisambiguation).toBe(true)

    // --- 3. Agent terminology check ---
    const hasAgentTerm = pageText?.toLowerCase().includes('agent') || false
    const hasDeprecatedTerm = pageText?.toLowerCase().includes('plugins endpoint') || false
    expect(hasAgentTerm).toBe(true)
    expect(hasDeprecatedTerm).toBe(false)

    // --- 4. Related Pages Cards section ---
    const relatedSection = page
      .locator('text=Related Pages')
      .or(page.locator('text=Related'))
      .first()
    const relatedVisible = await relatedSection.isVisible().catch(() => false)
    console.log(`Related Pages section visible: ${relatedVisible}`)

    // Look for Cards components
    const cards = page.locator('[class*="card"], .card, [data-card]')
    const cardCount = await cards.count()
    console.log(`Cards found: ${cardCount}`)

    // --- 5. Google Console screenshots ---
    const images = page.locator('img')
    const imageCount = await images.count()
    console.log(`Total images found: ${imageCount}`)

    const imageSrcs = await images.evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).src),
    )
    console.log('Image sources:', imageSrcs)

    // Screenshot of steps area
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'light-top-section.png'),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })

    // Scroll to bottom for Related Pages
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'light-bottom-section.png'),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })

    // Scroll to middle for steps
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3))
    await page.waitForTimeout(300)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'light-middle-section.png'),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })
  })

  test('dark mode - full page audit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(URL, { waitUntil: 'networkidle' })
    await page.waitForSelector('main', { timeout: 15000 })

    // Activate dark mode via theme toggle if available
    const themeToggle = page
      .locator(
        'button[aria-label*="dark"], button[aria-label*="theme"], button[aria-label*="Dark"]',
      )
      .first()
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click()
      await page.waitForTimeout(500)
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dark-full-page.png'),
      fullPage: true,
    })

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dark-top-section.png'),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dark-bottom-section.png'),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3))
    await page.waitForTimeout(300)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dark-middle-section.png'),
      clip: { x: 0, y: 0, width: 1280, height: 800 },
    })
  })
})
