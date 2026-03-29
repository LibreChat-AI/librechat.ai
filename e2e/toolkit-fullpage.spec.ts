import { test, expect, Page } from '@playwright/test'
import path from 'path'

const SCREENSHOT_DIR = 'test-results/toolkit'

async function goWithDark(page: Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark')
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    document.documentElement.style.colorScheme = 'dark'
  })
  await page.waitForTimeout(500)
}

async function goWithLight(page: Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    document.documentElement.style.colorScheme = 'light'
  })
  await page.waitForTimeout(400)
}

async function setAceEditorValue(page: Page, editorId: string, value: string) {
  await page.evaluate(
    ({ id, text }) => {
      const editor = (window as any).ace?.edit(id)
      if (editor) {
        editor.setValue(text, 1)
      }
    },
    { id: editorId, text: value },
  )
  await page.waitForTimeout(400)
}

test('yaml valid - full page light', async ({ page }) => {
  await goWithLight(page, '/docs/toolkit/yaml-validator')
  await page.waitForSelector('#YAML_EDITOR', { timeout: 15000 })
  await page.locator('#YAML_EDITOR').click()
  await setAceEditorValue(page, 'YAML_EDITOR', 'name: test\nversion: 1\nenabled: true')

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'full-yaml-light-valid.png'),
    fullPage: true,
  })

  // Green banner with YAML is valid
  const validBanner = page.locator('[role="status"]').filter({ hasText: /YAML is valid/i })
  await expect(validBanner).toBeVisible({ timeout: 5000 })
  console.log('Valid banner text:', await validBanner.textContent())
})

test('yaml valid - full page dark', async ({ page }) => {
  await goWithDark(page, '/docs/toolkit/yaml-validator')
  await page.waitForSelector('#YAML_EDITOR', { timeout: 15000 })
  await page.locator('#YAML_EDITOR').click()
  await setAceEditorValue(page, 'YAML_EDITOR', 'name: test\nversion: 1\nenabled: true')

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'full-yaml-dark-valid.png'),
    fullPage: true,
  })

  const validBanner = page.locator('[role="status"]').filter({ hasText: /YAML is valid/i })
  await expect(validBanner).toBeVisible({ timeout: 5000 })
})

test('yaml invalid - full page light', async ({ page }) => {
  await goWithLight(page, '/docs/toolkit/yaml-validator')
  await page.waitForSelector('#YAML_EDITOR', { timeout: 15000 })
  await page.locator('#YAML_EDITOR').click()
  await setAceEditorValue(page, 'YAML_EDITOR', 'name: test\n  bad_indent: value\n wrong: yes')

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'full-yaml-light-invalid.png'),
    fullPage: true,
  })

  const errorBanner = page.locator('[role="status"]').filter({ hasText: /line/i })
  await expect(errorBanner).toBeVisible({ timeout: 5000 })
  console.log('Error text:', await errorBanner.textContent())
})

test('print margin check', async ({ page }) => {
  await goWithLight(page, '/docs/toolkit/yaml-validator')
  await page.waitForSelector('#YAML_EDITOR', { timeout: 15000 })

  // Check if print margin is actually visible (has positive dimensions and is displayed)
  const printMarginVisible = await page.evaluate(() => {
    const el = document.querySelector('.ace_print-margin')
    if (!el) return { exists: false }
    const style = window.getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return {
      exists: true,
      display: style.display,
      visibility: style.visibility,
      width: rect.width,
      height: rect.height,
      left: rect.left,
      opacity: style.opacity,
    }
  })
  console.log('Print margin computed style:', JSON.stringify(printMarginVisible))
})

test('creds full page - light after generate', async ({ page }) => {
  await goWithLight(page, '/docs/toolkit/credentials-generator')
  const generateBtn = page.getByRole('button', { name: 'Generate new credentials' })
  await generateBtn.click()
  await page.waitForTimeout(500)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'full-creds-light-generated.png'),
    fullPage: true,
  })
})

test('creds full page - dark after generate', async ({ page }) => {
  await goWithDark(page, '/docs/toolkit/credentials-generator')
  const generateBtn = page.getByRole('button', { name: 'Generate new credentials' })
  await generateBtn.click()
  await page.waitForTimeout(500)

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'full-creds-dark-generated.png'),
    fullPage: true,
  })
})
