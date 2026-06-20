import { test, expect, Page } from '@playwright/test'

/**
 * Set the value of the Ace editor used by the YAML validator. Uses the editor
 * instance Ace attaches to its container element, falling back to the global
 * `ace` registry, so it does not depend on how the editor was constructed.
 */
async function setYamlEditorValue(page: Page, value: string) {
  await page.waitForFunction(() => {
    const el = document.getElementById('YAML_EDITOR') as (HTMLElement & { env?: unknown }) | null
    const w = window as unknown as { ace?: { edit?: (id: string) => unknown } }
    return Boolean(el && ((el as { env?: { editor?: unknown } }).env?.editor || w.ace?.edit))
  })

  await page.evaluate((text) => {
    const el = document.getElementById('YAML_EDITOR') as { env?: { editor?: unknown } } | null
    const w = window as unknown as { ace?: { edit?: (id: string) => unknown } }
    const editor = (el?.env?.editor ?? w.ace?.edit?.('YAML_EDITOR')) as {
      setValue: (text: string, cursorPos?: number) => void
    }
    editor.setValue(text, 1)
  }, value)
}

test.describe('Toolkit — YAML validator', () => {
  test('shows a success banner for valid YAML', async ({ page }) => {
    await page.goto('/docs/toolkit/yaml-validator')
    await page.waitForSelector('#YAML_EDITOR')

    await setYamlEditorValue(page, 'name: test\nversion: 1\nenabled: true')

    await expect(page.getByRole('status').filter({ hasText: /YAML is valid/i })).toBeVisible()
  })

  test('shows an error banner for invalid YAML', async ({ page }) => {
    await page.goto('/docs/toolkit/yaml-validator')
    await page.waitForSelector('#YAML_EDITOR')

    await setYamlEditorValue(page, 'name: test\n  bad_indent: value\n wrong: yes')

    await expect(page.getByRole('status').filter({ hasText: /line/i })).toBeVisible()
  })
})

test.describe('Toolkit — credentials generator', () => {
  test('generates non-empty credentials on click', async ({ page }) => {
    await page.goto('/docs/toolkit/credentials-generator')

    await page.getByRole('button', { name: 'Generate new credentials' }).click()

    await expect(page.getByRole('region', { name: 'Generated credentials' })).toBeVisible()

    // The first field is populated with a non-empty generated value.
    const credsKey = page.getByLabel('CREDS_KEY value')
    await expect(credsKey).toBeVisible()
    expect((await credsKey.inputValue()).length).toBeGreaterThan(0)
  })
})
