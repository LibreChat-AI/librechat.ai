import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  ZOOM,
  VARIANTS,
  type Variant,
  outputPath,
  screenshotBaseURL,
  themeBootstrap,
} from './config'

const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
const CONVERSATION_ID = process.env.DEMO_CONVERSATION_ID
const baseURL = screenshotBaseURL(process.env.DEMO_BASE_URL)

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

const NAVIGATION_TIMEOUT = 60_000
const POST_LOGIN_TIMEOUT = 45_000
const READY_STATE_TIMEOUT = 15_000

async function openAppPage(page: Page, url: string, label: string) {
  console.log(`loading ${label}: ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT })
  await page.waitForLoadState('load', { timeout: READY_STATE_TIMEOUT }).catch(() => {
    console.warn(`${label}: load event did not settle within ${READY_STATE_TIMEOUT}ms`)
  })
}

async function login(browser: Browser) {
  const context = await browser.newContext()
  try {
    const page = await context.newPage()
    await openAppPage(page, `${baseURL}/login`, 'login')
    await page.waitForSelector(SELECTORS.email, { timeout: 20_000 })
    await page.fill(SELECTORS.email, EMAIL!)
    await page.fill(SELECTORS.password, PASSWORD!)
    await page.click(SELECTORS.submit)
    await page.waitForURL(`${baseURL}/c/**`, { timeout: POST_LOGIN_TIMEOUT }).catch(() => undefined)
    // Hard-fail if we are still on the login page (bad credentials, rate limit,
    // etc.) so withRetry retries and ultimately exits non-zero instead of
    // capturing screenshots of the login/error screen.
    if (new URL(page.url()).pathname.startsWith('/login')) {
      throw new Error(`Login failed: still on ${page.url()} after submitting credentials`)
    }
    return await context.storageState()
  } finally {
    await context.close()
  }
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
  try {
    const page = await context.newPage()
    await openAppPage(page, `${baseURL}/c/${CONVERSATION_ID}`, variant.name)
    await page.waitForSelector(SELECTORS.message, { timeout: 30_000 })
    await page.addStyleTag({ content: DISABLE_MOTION_CSS })
    await page.evaluate((zoom) => {
      document.documentElement.style.setProperty('zoom', String(zoom))
    }, ZOOM)
    // Await web fonts without returning a non-serializable value to Playwright.
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await page.waitForTimeout(500)
    const file = outputPath(variant)
    await mkdir(dirname(file), { recursive: true })
    await page.screenshot({ path: file, animations: 'disabled' })
    console.log(`captured ${variant.name} -> ${variant.outputFile}`)
  } finally {
    await context.close()
  }
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
