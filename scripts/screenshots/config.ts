import { resolve } from 'node:path'

export const BASE_URL = 'https://chat.librechat.ai'
export const ZOOM = 1.1
// LibreChat persists the theme under this key (client/index.html reads it in an
// inline script before the bundle boots, and packages/client ThemeProvider uses
// the same key). Writing any other key leaves the app on its 'system' default.
export const THEME_STORAGE_KEY = 'color-theme'
export const IMG_DIR = resolve(process.cwd(), 'components/home/img')

export type Theme = 'light' | 'dark'
export type Device = 'desktop' | 'mobile'

export interface Variant {
  name: string
  device: Device
  theme: Theme
  viewport: { width: number; height: number }
  deviceScaleFactor: number
  outputFile: string
}

const DESKTOP_VIEWPORT = { width: 1280, height: 720 }
const MOBILE_VIEWPORT = { width: 390, height: 844 }
const DEVICE_SCALE_FACTOR = 2

export const VARIANTS: Variant[] = [
  {
    name: 'desktop-light',
    device: 'desktop',
    theme: 'light',
    viewport: DESKTOP_VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    outputFile: 'demo_light.png',
  },
  {
    name: 'desktop-dark',
    device: 'desktop',
    theme: 'dark',
    viewport: DESKTOP_VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    outputFile: 'demo_dark.png',
  },
  {
    name: 'mobile-light',
    device: 'mobile',
    theme: 'light',
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    outputFile: 'demo_mobile_light.png',
  },
  {
    name: 'mobile-dark',
    device: 'mobile',
    theme: 'dark',
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    outputFile: 'demo_mobile_dark.png',
  },
]

export function outputPath(variant: Variant): string {
  return resolve(IMG_DIR, variant.outputFile)
}

export function screenshotBaseURL(value: string | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : BASE_URL
}

/**
 * Returns a JS snippet (string) to run as a Playwright init script, forcing the
 * LibreChat theme before app code reads it.
 */
export function themeBootstrap(theme: Theme): string {
  return `try{localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)}, ${JSON.stringify(theme)})}catch(e){}`
}

/** Where failure diagnostics are written so CI can upload them as an artifact. */
export const DIAGNOSTICS_DIR = resolve(process.cwd(), 'screenshot-diagnostics')
