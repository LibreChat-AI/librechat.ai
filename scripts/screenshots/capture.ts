import { chromium, type Browser, type BrowserContext } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { BASE_URL, ZOOM, VARIANTS, type Variant, outputPath, themeBootstrap } from './config'

const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
const CONVERSATION_ID = process.env.DEMO_CONVERSATION_ID
const baseURL = process.env.DEMO_BASE_URL ?? BASE_URL

if (!EMAIL || !PASSWORD || !CONVERSATION_ID) {
  console.error('Missing required env: DEMO_EMAIL, DEMO_PASSWORD, DEMO_CONVERSATION_ID')
  process.exit(1)
}

// Selectors verified against the live demo in Step 4. Adjust there if the demo differs.
const SELECTORS = {
  email: 'input[name="email"]',
  password: 'input[name="password"]',
  submit: 'button[type="submit"]',
  // Any element that only exists once the conversation has rendered messages.
  message: '[data-testid="convo-icon"], .message, [data-testid="message"]',
}

const DISABLE_MOTION_CSS =
  '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;scroll-behavior:auto!important}'

async function login(browser: Browser) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' })
  await page.fill(SELECTORS.email, EMAIL!)
  await page.fill(SELECTORS.password, PASSWORD!)
  await page.click(SELECTORS.submit)
  // Logged-in app routes are under /c/...; fall back to network idle if URL differs.
  await page
    .waitForURL(`${baseURL}/c/**`, { timeout: 30_000 })
    .catch(() => page.waitForLoadState('networkidle'))
  // Hard-fail if we are still on the login page (bad credentials, rate limit,
  // etc.) so withRetry retries and ultimately exits non-zero instead of
  // capturing screenshots of the login/error screen.
  if (new URL(page.url()).pathname.startsWith('/login')) {
    throw new Error(`Login failed: still on ${page.url()} after submitting credentials`)
  }
  const state = await context.storageState()
  await context.close()
  return state
}

async function captureVariant(
  browser: Browser,
  storageState: Awaited<ReturnType<BrowserContext['storageState']>>,
  variant: Variant,
) {
  const context = await browser.newContext({
    storageState,
    viewport: variant.viewport,
    deviceScaleFactor: variant.deviceScaleFactor,
    isMobile: variant.device === 'mobile',
    hasTouch: variant.device === 'mobile',
    colorScheme: variant.theme,
  })
  await context.addInitScript(themeBootstrap(variant.theme))
  const page = await context.newPage()
  await page.goto(`${baseURL}/c/${CONVERSATION_ID}`, { waitUntil: 'networkidle' })
  await page.waitForSelector(SELECTORS.message, { timeout: 20_000 })
  await page.addStyleTag({ content: DISABLE_MOTION_CSS })
  await page.evaluate((zoom) => {
    document.documentElement.style.setProperty('zoom', String(zoom))
  }, ZOOM)
  // Await web fonts without returning a non-serializable value to Playwright.
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await page.waitForLoadState('networkidle')
  const file = outputPath(variant)
  await mkdir(dirname(file), { recursive: true })
  await page.screenshot({ path: file, animations: 'disabled' })
  await context.close()
  console.log(`captured ${variant.name} -> ${variant.outputFile}`)
}

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      console.warn(`${label}: attempt ${i}/${attempts} failed:`, err)
    }
  }
  throw lastErr
}

async function main() {
  const browser = await chromium.launch()
  try {
    const storageState = await withRetry('login', () => login(browser))
    for (const variant of VARIANTS) {
      await withRetry(variant.name, () => captureVariant(browser, storageState, variant))
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
