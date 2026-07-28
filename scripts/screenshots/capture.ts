import { chromium, type Browser, type Page } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  ZOOM,
  VARIANTS,
  type Variant,
  outputPath,
  screenshotBaseURL,
  themeBootstrap,
  DIAGNOSTICS_DIR,
} from './config'

const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
const CONVERSATION_ID = process.env.DEMO_CONVERSATION_ID
const baseURL = screenshotBaseURL(process.env.DEMO_BASE_URL)

// Do not add custom headers to the browser context. Playwright applies
// extraHTTPHeaders to every request including cross-origin ones, which turns
// them into preflighted CORS requests; third parties reject the unknown header
// and the page loses scripts it expects. Anything the demo's edge needs to
// recognise belongs in a rule keyed on something already present.

if (!EMAIL || !PASSWORD || !CONVERSATION_ID) {
  console.error('Missing required env: DEMO_EMAIL, DEMO_PASSWORD, DEMO_CONVERSATION_ID')
  process.exit(1)
}

// Verified against the live demo. Each entry lists fallbacks so a cosmetic
// markup change on the demo does not take the whole job down.
const SELECTORS = {
  email: 'input[name="email"], input#email',
  password: 'input[name="password"], input#password',
  submit: 'button[data-testid="login-button"], button[type="submit"]',
  // The demo sets interface.termsOfService.modalAcceptance, so a Terms dialog
  // covers the entire UI until it is dismissed. LibreChat's TermsAndConditionsModal
  // gives its buttons no test id, so match the label exactly: `:text-is()` avoids
  // hitting the neighbouring "I do not accept".
  acceptTerms: 'button:text-is("I accept")',
  // `.message-render` wraps every rendered message (LibreChat MessageParts.tsx),
  // so it only exists once the conversation body is on screen. Do not use
  // `convo-icon` here: that is the sidebar/endpoint icon and renders before any
  // message does, which would let us shoot an empty chat pane.
  message: '.message-render, [data-testid="message"]',
}

/**
 * Presents as an ordinary desktop browser rather than advertising
 * `HeadlessChrome`. This is hygiene, not a fix: a CI run with this user agent
 * still gets `/api/*` rejected, so the demo's 403 is not UA-driven. Kept
 * because it removes one variable from the next diagnosis.
 */
async function desktopUserAgent(browser: Browser): Promise<string> {
  const context = await browser.newContext()
  try {
    const page = await context.newPage()
    const ua = await page.evaluate(() => navigator.userAgent)
    return ua.replace('HeadlessChrome', 'Chrome')
  } finally {
    await context.close()
  }
}

const DISABLE_MOTION_CSS =
  '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;scroll-behavior:auto!important}'

const NAVIGATION_TIMEOUT = 60_000
const POST_LOGIN_TIMEOUT = 45_000
const READY_STATE_TIMEOUT = 15_000
const LOGIN_FORM_TIMEOUT = 45_000
const MESSAGE_TIMEOUT = 45_000
const TERMS_TIMEOUT = 8_000
const RETRY_BACKOFF_MS = 10_000

/** Recorded in diagnostics to show what the app managed to fetch. */
const CRITICAL_API = /\/api\/(config|banner|auth\/refresh)/

/**
 * LibreChat renders the login form only when `startupConfig.emailLoginEnabled`
 * is true, so a failure here means no form ever appears. Kept narrower than
 * CRITICAL_API: `/api/banner` is optional and `/api/auth/refresh` returns 404
 * for a logged-out visitor, so neither implies anything is wrong.
 */
const BOOT_BLOCKING_API = /\/api\/config/

interface Probe {
  consoleErrors: string[]
  failedRequests: string[]
  criticalApi: string[]
  blockedResponses: Promise<string>[]
}

/**
 * Captures who rejected a boot-blocking request. `via: 1.1 Caddy` means the
 * demo's own origin answered; a response carrying `cf-ray`/`cf-mitigated` but
 * no `via` was generated at the edge. That distinction decides whether the
 * limit is fixed in LibreChat's config or in the CDN dashboard, and it is not
 * recoverable from the status code alone.
 */
async function describeBlocked(response: {
  status(): number
  url(): string
  headers(): Record<string, string>
  text(): Promise<string>
}): Promise<string> {
  const headers = response.headers()
  const named = ['server', 'via', 'cf-ray', 'cf-mitigated', 'retry-after', 'content-type']
    .filter((name) => headers[name])
    .map((name) => `${name}: ${headers[name]}`)
  let body: string
  try {
    body = (await response.text()).slice(0, 300).replaceAll(/\s+/g, ' ').trim()
  } catch {
    body = '(body unavailable)'
  }
  return [`${response.status()} ${response.url()}`, ...named, `body: ${body || '(empty)'}`].join(
    '\n    ',
  )
}

/**
 * Records why a page failed to render. Without this a CDN block and a genuine
 * markup change produce the same bare "selector timed out" and neither is
 * actionable from the CI log.
 */
function attachProbe(page: Page): Probe {
  const probe: Probe = {
    consoleErrors: [],
    failedRequests: [],
    criticalApi: [],
    blockedResponses: [],
  }
  page.on('console', (msg) => {
    if (msg.type() === 'error') probe.consoleErrors.push(msg.text().slice(0, 300))
  })
  page.on('requestfailed', (request) => {
    probe.failedRequests.push(`${request.failure()?.errorText ?? 'failed'} ${request.url()}`)
  })
  page.on('response', (response) => {
    const url = response.url()
    if (!CRITICAL_API.test(url)) return
    probe.criticalApi.push(`${response.status()} ${url}`)
    if (response.ok()) return
    probe.failedRequests.push(`HTTP ${response.status()} ${url}`)
    // The SPA retries hard; the first couple are enough to identify the source.
    if (probe.blockedResponses.length < 2 && BOOT_BLOCKING_API.test(url)) {
      probe.blockedResponses.push(
        describeBlocked(response).catch(() => `${response.status()} ${url} (details unavailable)`),
      )
    }
  })
  return probe
}

async function dumpDiagnostics(page: Page, probe: Probe, label: string, attempt: number) {
  const slug = `${label}-attempt-${attempt}`
  try {
    await mkdir(DIAGNOSTICS_DIR, { recursive: true })
    await page.screenshot({ path: join(DIAGNOSTICS_DIR, `${slug}.png`), fullPage: true })
    await writeFile(join(DIAGNOSTICS_DIR, `${slug}.html`), await page.content(), 'utf8')
    const visibleText = await page
      .evaluate(() => document.body.innerText.slice(0, 2000))
      .catch(() => '(unavailable)')
    const report = [
      `url: ${page.url()}`,
      `title: ${await page.title().catch(() => '(unavailable)')}`,
      '',
      '--- visible text ---',
      visibleText,
      '',
      '--- critical API responses ---',
      probe.criticalApi.join('\n') || '(none observed)',
      '',
      '--- failed requests ---',
      probe.failedRequests.join('\n') || '(none)',
      '',
      '--- who rejected the boot-blocking request ---',
      (await Promise.all(probe.blockedResponses)).join('\n') || '(nothing was rejected)',
      '',
      '--- console errors ---',
      probe.consoleErrors.join('\n') || '(none)',
      '',
    ].join('\n')
    await writeFile(join(DIAGNOSTICS_DIR, `${slug}.txt`), report, 'utf8')
    console.error(`--- diagnostics for ${slug} ---\n${report}`)
  } catch (err) {
    console.error(`${slug}: could not write diagnostics:`, err)
  }
}

/**
 * Turns the generic selector timeout into the actual reason when we can name
 * it, so a future failure is readable straight from the job log.
 */
function explainFailure(probe: Probe, fallback: string): string {
  // The SPA retries the request, so dedupe to keep the message readable.
  const blocked = [
    ...new Set(probe.failedRequests.filter((entry) => BOOT_BLOCKING_API.test(entry))),
  ]
  if (blocked.length > 0) {
    return `${fallback}\nCause: the demo did not serve its startup config (${blocked.join('; ')}), so the app rendered an error instead of the UI. See the "who rejected the boot-blocking request" section of the diagnostics for whether the edge or the origin answered.`
  }
  return fallback
}

async function openAppPage(page: Page, url: string, label: string) {
  console.log(`loading ${label}: ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATION_TIMEOUT })
  await page.waitForLoadState('load', { timeout: READY_STATE_TIMEOUT }).catch(() => {
    console.warn(`${label}: load event did not settle within ${READY_STATE_TIMEOUT}ms`)
  })
}

/**
 * Signs in on the page that will take the screenshot.
 *
 * Deliberately not shared via `storageState`: LibreChat keeps the access token
 * in memory and rotates the refresh token, so replaying one saved session into
 * a second context gets 401 from /api/auth/refresh and bounces to
 * /login?redirect_to=..., which is a login screen where the chat should be.
 * Each context therefore establishes its own session.
 */
/**
 * Dismisses the demo's Terms dialog when it appears. Best-effort: acceptance is
 * recorded against the account, so it typically only shows for the first
 * variant, and a run where it never appears is not an error.
 */
async function acceptTermsIfPresent(page: Page, label: string) {
  const accept = page.locator(SELECTORS.acceptTerms)
  try {
    await accept.waitFor({ state: 'visible', timeout: TERMS_TIMEOUT })
  } catch {
    return
  }
  console.log(`${label}: dismissing terms dialog`)
  await accept.click()
  await accept.waitFor({ state: 'hidden', timeout: TERMS_TIMEOUT })
}

async function signIn(page: Page) {
  await openAppPage(page, `${baseURL}/login`, 'login')
  await page.waitForSelector(SELECTORS.email, { timeout: LOGIN_FORM_TIMEOUT })
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
}

async function captureVariant(
  browser: Browser,
  variant: Variant,
  userAgent: string,
  attempt: number,
) {
  const context = await browser.newContext({
    userAgent,
    viewport: variant.viewport,
    deviceScaleFactor: variant.deviceScaleFactor,
    isMobile: variant.device === 'mobile',
    hasTouch: variant.device === 'mobile',
    colorScheme: variant.theme,
  })
  await context.addInitScript(themeBootstrap(variant.theme))
  try {
    const page = await context.newPage()
    const probe = attachProbe(page)
    try {
      await signIn(page)
      await openAppPage(page, `${baseURL}/c/${CONVERSATION_ID}`, variant.name)
      // A bounce back to /login means the session did not survive the
      // navigation; fail here rather than shooting the login screen.
      if (new URL(page.url()).pathname.startsWith('/login')) {
        throw new Error(`Session lost: redirected to ${page.url()} instead of the conversation`)
      }
      // Messages render behind the Terms overlay, so wait for them first: by
      // then the app is up and the dialog is either present or never coming.
      await page.waitForSelector(SELECTORS.message, { timeout: MESSAGE_TIMEOUT })
      await acceptTermsIfPresent(page, variant.name)
      await page.addStyleTag({ content: DISABLE_MOTION_CSS })
      await page.evaluate((zoom) => {
        document.documentElement.style.setProperty('zoom', String(zoom))
      }, ZOOM)
      // Await web fonts without returning a non-serializable value to Playwright.
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      await page.waitForTimeout(500)
      // These images ship straight onto the landing page, so refuse to save one
      // with a dialog over it. The terms modal did exactly that and the run
      // still reported success.
      const dialog = page.locator('[role="dialog"]').first()
      if (await dialog.isVisible().catch(() => false)) {
        const text = (await dialog.innerText().catch(() => ''))
          .replaceAll(/\s+/g, ' ')
          .slice(0, 120)
        throw new Error(`A dialog is covering the UI, refusing to capture: "${text}"`)
      }
      const file = outputPath(variant)
      await mkdir(dirname(file), { recursive: true })
      await page.screenshot({ path: file, animations: 'disabled' })
      console.log(`captured ${variant.name} -> ${variant.outputFile}`)
    } catch (err) {
      await dumpDiagnostics(page, probe, variant.name, attempt)
      throw new Error(explainFailure(probe, err instanceof Error ? err.message : String(err)), {
        cause: err,
      })
    }
  } finally {
    await context.close()
  }
}

async function withRetry<T>(
  label: string,
  fn: (attempt: number) => Promise<T>,
  attempts = 2,
): Promise<T> {
  let lastErr: unknown
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn(i)
    } catch (err) {
      lastErr = err
      console.warn(`${label}: attempt ${i}/${attempts} failed:`, err)
      // Back off before retrying: an immediate retry runs straight back into a
      // rate limit or bot challenge that a short pause would have cleared.
      if (i < attempts) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS))
      }
    }
  }
  throw lastErr
}

async function main() {
  const browser = await chromium.launch()
  try {
    const userAgent = await desktopUserAgent(browser)
    console.log(`using user agent: ${userAgent}`)
    for (const variant of VARIANTS) {
      await withRetry(variant.name, (attempt) =>
        captureVariant(browser, variant, userAgent, attempt),
      )
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
