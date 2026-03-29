import { test, expect } from '@playwright/test'

test('yaml page - cards reference section', async ({ page }) => {
  await page.goto('/docs/configuration/librechat_yaml', { waitUntil: 'networkidle' })
  await page.emulateMedia({ colorScheme: 'light' })

  // Scroll to the Reference section
  const refHeading = page.getByRole('heading', { name: 'Reference' })
  await expect(refHeading).toBeVisible()
  await refHeading.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)

  // Screenshot the Reference/Cards area
  const box = await refHeading.boundingBox()
  if (box) {
    await page.screenshot({
      path: 'e2e/screenshots/yaml-light-reference-cards.png',
      clip: {
        x: Math.max(0, box.x - 20),
        y: Math.max(0, box.y - 10),
        width: 1000,
        height: 300,
      },
    })
  }

  // Check for card links near Reference heading
  const links = page
    .locator('a')
    .filter({ hasText: /AI Credentials|Object Structure|Custom Config|Example/i })
  const count = await links.count()
  console.log(`Found ${count} reference card links`)
  expect(count).toBeGreaterThan(0)

  // Dark mode reference section
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.waitForTimeout(400)
  await refHeading.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const darkBox = await refHeading.boundingBox()
  if (darkBox) {
    await page.screenshot({
      path: 'e2e/screenshots/yaml-dark-reference-cards.png',
      clip: {
        x: Math.max(0, darkBox.x - 20),
        y: Math.max(0, darkBox.y - 10),
        width: 1000,
        height: 300,
      },
    })
  }
})
