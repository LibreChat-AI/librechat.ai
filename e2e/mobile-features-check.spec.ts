import { test, expect } from '@playwright/test'

test.describe('Mobile features page layout check', () => {
  test.use({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  })

  test('captures full features page at multiple scroll positions', async ({ page }) => {
    await page.goto('/docs/features', { waitUntil: 'networkidle' })

    // Wait for page content to fully render
    await page.waitForTimeout(1500)

    // Screenshot 1: top of page
    await page.screenshot({
      path: 'test-results/mobile-features-01-top.png',
      fullPage: false,
    })

    // Screenshot 2: scroll down 812px (one viewport)
    await page.evaluate(() => window.scrollTo({ top: 812, behavior: 'auto' }))
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/mobile-features-02-scroll1.png',
      fullPage: false,
    })

    // Screenshot 3: scroll down 1624px (two viewports)
    await page.evaluate(() => window.scrollTo({ top: 1624, behavior: 'auto' }))
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/mobile-features-03-scroll2.png',
      fullPage: false,
    })

    // Screenshot 4: scroll down 2436px (three viewports)
    await page.evaluate(() => window.scrollTo({ top: 2436, behavior: 'auto' }))
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/mobile-features-04-scroll3.png',
      fullPage: false,
    })

    // Screenshot 5: scroll to bottom
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
    )
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/mobile-features-05-bottom.png',
      fullPage: false,
    })

    // Full-page screenshot for overview
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
    await page.waitForTimeout(300)
    await page.screenshot({
      path: 'test-results/mobile-features-full.png',
      fullPage: true,
    })

    // Capture page metrics for overflow detection
    const metrics = await page.evaluate(() => {
      const { body } = document
      const html = document.documentElement
      return {
        bodyScrollWidth: body.scrollWidth,
        bodyOffsetWidth: body.offsetWidth,
        viewportWidth: window.innerWidth,
        totalHeight: Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight,
        ),
        hasHorizontalOverflow: body.scrollWidth > window.innerWidth,
      }
    })

    console.log('Page metrics:', JSON.stringify(metrics, null, 2))

    // Assert no horizontal overflow
    expect(metrics.hasHorizontalOverflow).toBe(false)
    expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth)
  })

  test('checks layout of specific sections', async ({ page }) => {
    await page.goto('/docs/features', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)

    // Check for horizontal overflow on any direct child of main content
    const overflowElements = await page.evaluate(() => {
      const results: { tag: string; class: string; scrollWidth: number; clientWidth: number }[] = []
      for (const el of document.querySelectorAll('*')) {
        const htmlEl = el as HTMLElement
        if (htmlEl.scrollWidth > window.innerWidth + 5) {
          results.push({
            tag: htmlEl.tagName,
            class: htmlEl.className?.toString().slice(0, 80) ?? '',
            scrollWidth: htmlEl.scrollWidth,
            clientWidth: htmlEl.clientWidth,
          })
        }
      }
      return results.slice(0, 20)
    })

    console.log('Overflow elements:', JSON.stringify(overflowElements, null, 2))

    // Screenshot each section area with annotations
    const sections = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      return headings.map((h) => {
        const rect = (h as HTMLElement).getBoundingClientRect()
        return {
          text: h.textContent?.trim().slice(0, 60),
          tag: h.tagName,
          top: rect.top + window.scrollY,
        }
      })
    })

    console.log('Page sections:', JSON.stringify(sections, null, 2))
  })
})
