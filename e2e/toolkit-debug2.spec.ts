import { test } from '@playwright/test'
import path from 'path'

const SCREENSHOT_DIR = 'test-results/toolkit'

test.skip('debug - credentials generator full', async ({ page }) => {
  await page.goto('/docs/toolkit/credentials-generator')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug-creds-full.png'), fullPage: true })

  const buttons = await page.locator('button').all()
  console.log('=== CREDS BUTTONS (after 1s wait) ===')
  for (const btn of buttons) {
    const text = await btn.textContent()
    const ariaLabel = await btn.getAttribute('aria-label')
    console.log(`  btn: "${text?.trim()}" aria-label="${ariaLabel}"`)
  }

  // Check URL
  console.log('Current URL:', page.url())

  // Check main content area
  const mainContent = await page.locator('main').textContent()
  console.log('Main content excerpt:', mainContent?.substring(0, 500))
})

test.skip('debug - yaml validator full', async ({ page }) => {
  await page.goto('/docs/toolkit/yaml-validator')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug-yaml-full.png'), fullPage: true })

  console.log('YAML URL:', page.url())

  const mainContent = await page.locator('main').textContent()
  console.log('YAML Main content excerpt:', mainContent?.substring(0, 500))

  const buttons = await page.locator('button').all()
  console.log('=== YAML BUTTONS (after 1s wait) ===')
  for (const btn of buttons) {
    const text = await btn.textContent()
    const ariaLabel = await btn.getAttribute('aria-label')
    console.log(`  btn: "${text?.trim()}" aria-label="${ariaLabel}"`)
  }

  // Look for any editor
  const allDivs = await page
    .locator('div[class*="editor"], div[id*="editor"], div[class*="ace"], div[class*="cm-"]')
    .all()
  console.log(`Editor divs found: ${allDivs.length}`)
  for (const d of allDivs) {
    const id = await d.getAttribute('id')
    const cls = await d.getAttribute('class')
    console.log(`  div id="${id}" class="${cls?.substring(0, 80)}"`)
  }
})
