import { describe, it, expect } from 'vitest'
import {
  VARIANTS,
  outputPath,
  themeBootstrap,
  THEME_STORAGE_KEY,
  IMG_DIR,
  BASE_URL,
  screenshotBaseURL,
} from './config'

describe('screenshot config', () => {
  it('defines exactly the four hero image variants', () => {
    expect(VARIANTS).toHaveLength(4)
    const files = VARIANTS.map((v) => v.outputFile).sort()
    expect(files).toEqual(
      ['demo_dark.png', 'demo_light.png', 'demo_mobile_dark.png', 'demo_mobile_light.png'].sort(),
    )
  })

  it('uses portrait viewports for mobile and landscape for desktop, all at 2x', () => {
    for (const v of VARIANTS) {
      if (v.device === 'mobile') {
        expect(v.viewport.height).toBeGreaterThan(v.viewport.width)
      } else {
        expect(v.viewport.width).toBeGreaterThan(v.viewport.height)
      }
      expect(v.deviceScaleFactor).toBe(2)
    }
  })

  it('covers both themes for both devices', () => {
    const combos = VARIANTS.map((v) => `${v.device}-${v.theme}`).sort()
    expect(combos).toEqual(['desktop-dark', 'desktop-light', 'mobile-dark', 'mobile-light'])
  })

  it('resolves output paths under components/home/img', () => {
    const desktopLight = VARIANTS.find((v) => v.name === 'desktop-light')!
    const p = outputPath(desktopLight)
    expect(p).toMatch(/components\/home\/img\/demo_light\.png$/)
  })

  it('builds a theme bootstrap snippet for each theme', () => {
    expect(themeBootstrap('dark')).toContain('"dark"')
    expect(themeBootstrap('light')).toContain('"light"')
    expect(themeBootstrap('dark')).toContain(THEME_STORAGE_KEY)
  })

  it('keeps every output path inside the image directory', () => {
    for (const v of VARIANTS) {
      expect(outputPath(v).startsWith(IMG_DIR)).toBe(true)
    }
  })

  it('defaults blank screenshot base URLs and normalizes explicit overrides', () => {
    expect(screenshotBaseURL(undefined)).toBe(BASE_URL)
    expect(screenshotBaseURL('')).toBe(BASE_URL)
    expect(screenshotBaseURL('   ')).toBe(BASE_URL)
    expect(screenshotBaseURL(' https://example.test/ ')).toBe('https://example.test')
  })
})
