import { test } from '@playwright/test'
import path from 'path'

const SCREENSHOT_DIR = 'test-results/toolkit'

test.skip('debug - credentials generator DOM', async ({ page }) => {
  await page.goto('/docs/toolkit/credentials-generator')
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'debug-creds-initial.png'),
    fullPage: true,
  })

  // Log all button text
  const buttons = await page.locator('button').all()
  console.log('=== BUTTONS ===')
  for (const btn of buttons) {
    const text = await btn.textContent()
    const ariaLabel = await btn.getAttribute('aria-label')
    console.log(`  btn: "${text?.trim()}" aria-label="${ariaLabel}"`)
  }

  // Log page title area
  const headings = await page.locator('h1, h2, h3').all()
  console.log('=== HEADINGS ===')
  for (const h of headings) {
    console.log(`  ${await h.evaluate((el) => el.tagName)}: "${(await h.textContent())?.trim()}"`)
  }
})

test.skip('debug - yaml validator DOM', async ({ page }) => {
  await page.goto('/docs/toolkit/yaml-validator')
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'debug-yaml-initial.png'),
    fullPage: true,
  })

  // Log all interactive elements
  const buttons = await page.locator('button').all()
  console.log('=== YAML BUTTONS ===')
  for (const btn of buttons) {
    console.log(`  btn: "${(await btn.textContent())?.trim()}"`)
  }

  // Check for ace editor textarea
  const aceTextarea = page.locator('.ace_text-input')
  const aceCount = await aceTextarea.count()
  console.log(`Ace text-input count: ${aceCount}`)

  // Check for any textarea
  const textareas = await page.locator('textarea').all()
  console.log(`Textareas: ${textareas.length}`)
  for (const ta of textareas) {
    const id = await ta.getAttribute('id')
    const cls = await ta.getAttribute('class')
    console.log(`  textarea id="${id}" class="${cls}"`)
  }

  // Check editor container
  const editorEl = page.locator('#YAML_EDITOR, [id*="editor"], [class*="editor"]').first()
  console.log('Editor element found:', (await editorEl.count()) > 0)
})
