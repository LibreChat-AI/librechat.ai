import { resolve } from 'node:path'

export const BASE_URL = 'https://chat.librechat.ai'
export const ZOOM = 1.1
export const THEME_STORAGE_KEY = 'theme'
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
 * LibreChat theme before app code reads it. THEME_STORAGE_KEY is the best-known
 * default; verify it against the live demo in Task 2 and adjust if needed.
 */
export function themeBootstrap(theme: Theme): string {
  return `try{localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)}, ${JSON.stringify(theme)})}catch(e){}`
}
