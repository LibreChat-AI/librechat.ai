import { chromium, type Browser, type Page } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  VARIANTS,
  type Variant,
  outputPath,
  screenshotBaseURL,
  themeBootstrap,
  DIAGNOSTICS_DIR,
} from './config'

const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
const baseURL = screenshotBaseURL(process.env.DEMO_BASE_URL)

/**
 * The agent to open the new-chat screen with. Selecting it is what puts the
 * LibreChat logo and wordmark in the middle of the shot and "Message LibreChat"
 * in the composer; without it the screen is branded with whatever model the
 * demo defaults to, which is not what belongs on the landing page.
 *
 * LibreChat reads `agent_id` from the query string (client/src/hooks/Input/
 * useQueryParams.ts), so this needs no clicking through the picker.
 */
const AGENT_ID = process.env.DEMO_AGENT_ID?.trim() || ''

/**
 * The agent is resolved by this name when DEMO_AGENT_ID is unset, so a rebuilt
 * agent with a new id keeps working. Agent ids are opaque and easy to leave
 * stale; the name is what anyone looking at the image would recognise.
 */
const AGENT_NAME = process.env.DEMO_AGENT_NAME?.trim() || 'LibreChat'

// Do not add custom headers to the browser context. Playwright applies
// extraHTTPHeaders to every request including cross-origin ones, which turns
// them into preflighted CORS requests; third parties reject the unknown header
// and the page loses scripts it expects. Anything the demo's edge needs to
// recognise belongs in a rule keyed on something already present.

if (!EMAIL || !PASSWORD) {
  console.error('Missing required env: DEMO_EMAIL, DEMO_PASSWORD')
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
  // The composer. Present once the new-chat screen has rendered, on every
  // viewport, so it is the readiness signal for the shot.
  composer: '[data-testid="text-input"]',
  // One row in the sidebar conversation list.
  sidebarChat: '[data-testid="convo-item"]',
}

/**
 * The sidebar carrying a column of different provider icons is the point of
 * the hero image. If the demo account gets wiped or reseeded thinly we would
 * otherwise ship a near-empty sidebar and only notice on the live site.
 * Re-run scripts/screenshots/seed-demo.js if this trips.
 */
const MIN_SIDEBAR_CHATS = 10

/** The inventory is the same for every variant; one report per run is enough. */
let inventoryLogged = false

/** Resolved once from the first variant and reused, since it cannot change. */
let resolvedAgentId: string | null = null

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
const APP_READY_TIMEOUT = 45_000
const TERMS_TIMEOUT = 8_000
const AGENT_SELECT_TIMEOUT = 20_000
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
  /** Bodies of the app's own authenticated inventory calls, if it made them. */
  inventory: {
    endpoints: Promise<unknown> | null
    models: Promise<unknown> | null
    agents: Promise<unknown> | null
  }
}

/** Matched on the app's own requests to harvest the endpoint inventory. */
const INVENTORY_API = {
  endpoints: /\/api\/endpoints(\?|$)/,
  models: /\/api\/models(\?|$)/,
  agents: /\/api\/agents(\?|$)/,
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
    inventory: { endpoints: null, models: null, agents: null },
  }
  page.on('response', (response) => {
    if (!response.ok()) return
    const url = response.url()
    if (INVENTORY_API.endpoints.test(url)) {
      probe.inventory.endpoints ??= response.json().catch(() => null)
    } else if (INVENTORY_API.models.test(url)) {
      probe.inventory.models ??= response.json().catch(() => null)
    } else if (INVENTORY_API.agents.test(url)) {
      probe.inventory.agents ??= response.json().catch(() => null)
    }
  })
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
  // Only real HTTP rejections count. The SPA cancels in-flight requests when it
  // navigates, which surfaces as `net::ERR_ABORTED /api/config` on a perfectly
  // healthy run and otherwise blames the CDN for unrelated failures.
  // Dedupe too, since the SPA retries.
  const blocked = [
    ...new Set(
      probe.failedRequests.filter(
        (entry) => entry.startsWith('HTTP ') && BOOT_BLOCKING_API.test(entry),
      ),
    ),
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

/**
 * Reports every endpoint and model the demo actually serves.
 *
 * seed-demo.js has to name endpoints that exist, because one the server does
 * not know renders a generic icon: invisible in review, obvious in the hero
 * image. These routes need a session, so this is the only place that can see
 * them. Printed once per run, and never fatal, since it is only reference
 * output.
 */
async function logEndpointInventory(probe: Probe) {
  // Read the app's own responses rather than issuing our own requests. These
  // routes need the Bearer token that LibreChat's client holds in memory, so
  // neither page.request (cookies only) nor a raw fetch in the page would be
  // authenticated. Reusing what the app already fetched sidesteps that, and
  // avoids page.evaluate entirely: tsx compiles this file with esbuild's
  // keepNames, which injects a `__name` helper that does not exist in the
  // browser realm, so evaluated closures throw on arrival.
  const endpoints = (await probe.inventory.endpoints) as Record<
    string,
    Record<string, unknown>
  > | null
  const models = ((await probe.inventory.models) ?? {}) as Record<string, string[]>
  if (!endpoints) {
    console.warn('endpoint inventory unavailable: the app did not fetch /api/endpoints')
    return
  }

  console.log('--- demo endpoint inventory (keep seed-demo.js CHATS in sync) ---')
  for (const name of Object.keys(endpoints).sort()) {
    const config = endpoints[name] ?? {}
    const type = config.type ? ` type=${String(config.type)}` : ''
    const icon = config.iconURL ? ' iconURL=yes' : ''
    const available = Array.isArray(models[name]) ? models[name] : []
    const sample = available.slice(0, 4).join(', ')
    console.log(
      `  ${name}${type}${icon} models=${available.length}${sample ? ` [${sample}${available.length > 4 ? ', …' : ''}]` : ''}`,
    )
  }

  // Agents are what the hero shot is branded with, so their ids matter as much
  // as the endpoint names; DEMO_AGENT_ID has to name one that exists.
  const agentsBody = (await probe.inventory.agents) as { data?: unknown[] } | unknown[] | null
  const agents = Array.isArray(agentsBody) ? agentsBody : (agentsBody?.data ?? [])
  console.log(`  agents available: ${agents.length}`)
  for (const entry of agents as Record<string, unknown>[]) {
    const avatar = entry.avatar as { filepath?: string } | string | null | undefined
    const avatarPath = typeof avatar === 'string' ? avatar : avatar?.filepath
    console.log(
      `    ${String(entry.id)} name=${JSON.stringify(entry.name)}` +
        ` tools=${Array.isArray(entry.tools) ? entry.tools.length : 0}` +
        `${avatarPath ? ` avatar=${avatarPath}` : ' avatar=none'}`,
    )
  }
  console.log('--- end inventory ---')
}

/** Reads the agent list out of whichever shape the API returned. */
function agentList(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[]
  const data = (body as { data?: unknown } | null)?.data
  return Array.isArray(data) ? (data as Record<string, unknown>[]) : []
}

/**
 * Finds the agent to brand the shot with, by name, from the list the app
 * already fetched. DEMO_AGENT_ID short-circuits this when a specific one is
 * wanted.
 */
async function resolveAgentId(probe: Probe): Promise<string> {
  if (AGENT_ID) return AGENT_ID
  if (resolvedAgentId) return resolvedAgentId

  const agents = agentList(await probe.inventory.agents)
  const match = agents.find((agent) => agent.name === AGENT_NAME)
  if (!match?.id) {
    const names = agents.map((agent) => JSON.stringify(agent.name)).join(', ') || '(none)'
    throw new Error(
      `No agent named ${JSON.stringify(AGENT_NAME)} on the demo. Available: ${names}. ` +
        'Set DEMO_AGENT_ID or DEMO_AGENT_NAME to match one that exists.',
    )
  }
  resolvedAgentId = String(match.id)
  console.log(`resolved agent ${JSON.stringify(AGENT_NAME)} -> ${resolvedAgentId}`)
  return resolvedAgentId
}

/**
 * Confirms the agent actually got selected.
 *
 * The composer placeholder tracks the active endpoint, so it reads "Message
 * LibreChat" once the agent is applied and "Message GPT-5.5" (or whatever the
 * demo defaults to) when it is not. Selection happens via a query parameter
 * the app may silently ignore if the id no longer exists, and a shot branded
 * with a third-party model is worse than no shot at all, so fail rather than
 * ship one.
 */
async function assertAgentSelected(page: Page, variant: Variant) {
  const composer = page.locator(SELECTORS.composer)
  const deadline = Date.now() + AGENT_SELECT_TIMEOUT
  let placeholder: string | null = null
  // Poll: the placeholder is rewritten a beat after the agent applies, so a
  // single read can catch the pre-selection value and fail a healthy run.
  do {
    placeholder = await composer.getAttribute('placeholder').catch(() => null)
    if (placeholder?.includes(AGENT_NAME)) break
    await page.waitForTimeout(250)
  } while (Date.now() < deadline)

  if (!placeholder?.includes(AGENT_NAME)) {
    throw new Error(
      `Composer reads ${JSON.stringify(placeholder)}, expected it to mention ${JSON.stringify(AGENT_NAME)}. ` +
        `The "${AGENT_ID}" agent was not selected, so the shot would carry the wrong branding. ` +
        'Check DEMO_AGENT_ID against the agents the demo actually has.',
    )
  }
  console.log(`${variant.name}: agent "${AGENT_NAME}" selected`)
}

/**
 * Guards the point of the image. Desktop only: the sidebar is collapsed behind
 * a hamburger on mobile, which is what the original mobile shots showed too.
 */
async function assertSidebarPopulated(page: Page, variant: Variant) {
  if (variant.device !== 'desktop') return
  const chats = page.locator(SELECTORS.sidebarChat)
  await chats.first().waitFor({ state: 'visible', timeout: APP_READY_TIMEOUT })
  const count = await chats.count()
  if (count < MIN_SIDEBAR_CHATS) {
    throw new Error(
      `Sidebar has ${count} conversations, expected at least ${MIN_SIDEBAR_CHATS}. ` +
        'The demo account looks unseeded; run scripts/screenshots/seed-demo.js.',
    )
  }
  console.log(`${variant.name}: sidebar has ${count} conversations`)
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
      // Shoot the new-chat screen rather than a conversation: it shows the
      // logo, the composer and the full sidebar, and it is the only frame that
      // fits a mobile viewport without cutting the interface in half.
      // Load once bare. The agent has to be named in the URL to be selected,
      // but its id is only knowable from the list the app fetches after it
      // boots, so the first load is what makes that list available.
      await openAppPage(page, `${baseURL}/c/new`, variant.name)
      // A bounce back to /login means the session did not survive the
      // navigation; fail here rather than shooting the login screen.
      if (new URL(page.url()).pathname.startsWith('/login')) {
        throw new Error(`Session lost: redirected to ${page.url()} instead of the app`)
      }
      // The composer renders behind the Terms overlay, so wait for it first: by
      // then the app is up and the dialog is either present or never coming.
      await page.waitForSelector(SELECTORS.composer, { timeout: APP_READY_TIMEOUT })
      await acceptTermsIfPresent(page, variant.name)
      if (!inventoryLogged) {
        inventoryLogged = true
        await logEndpointInventory(probe)
      }

      const target = new URL(`${baseURL}/c/new`)
      target.searchParams.set('endpoint', 'agents')
      target.searchParams.set('agent_id', await resolveAgentId(probe))
      await openAppPage(page, target.toString(), `${variant.name} (agent)`)
      await page.waitForSelector(SELECTORS.composer, { timeout: APP_READY_TIMEOUT })
      await assertAgentSelected(page, variant)
      await assertSidebarPopulated(page, variant)
      // Park the pointer and drop focus. Otherwise whatever was last clicked
      // keeps its focus ring and whatever the pointer rests over keeps its
      // hover toolbar, which differs between variants and lands on the
      // landing page as a stray highlight.
      await page.mouse.move(0, 0)
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
      await page.addStyleTag({ content: DISABLE_MOTION_CSS })
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
