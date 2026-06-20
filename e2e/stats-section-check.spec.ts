import { test, expect } from '@playwright/test'

const STAT_LABELS = ['GitHub Stars', 'Docker Pulls', 'Contributors']

test.describe('Homepage — open source stats section', () => {
  test('shows the three stat labels', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /open source, community driven/i }),
    ).toBeVisible()

    // The labels are always rendered. The values intentionally fall back to "--"
    // when the server-side GitHub/Docker Hub fetches are unavailable (e.g. rate
    // limited on shared CI IPs), so we assert structure, not live numbers.
    for (const label of STAT_LABELS) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
  })

  test('lays the three stats out in a single row on desktop', async ({ page }) => {
    await page.goto('/')

    const boxes = await Promise.all(
      STAT_LABELS.map((label) => page.getByText(label, { exact: true }).boundingBox()),
    )
    expect(boxes.every((box) => box !== null)).toBe(true)

    const [stars, pulls, contributors] = boxes as Array<NonNullable<(typeof boxes)[number]>>
    // Same vertical band, spread left-to-right.
    expect(Math.abs(stars.y - pulls.y)).toBeLessThan(80)
    expect(Math.abs(pulls.y - contributors.y)).toBeLessThan(80)
    expect(pulls.x).toBeGreaterThan(stars.x)
    expect(contributors.x).toBeGreaterThan(pulls.x)
  })

  test('does not overflow horizontally on a 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /open source, community driven/i }),
    ).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    expect(overflow).toBe(false)
  })
})
