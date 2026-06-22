# Automated Hero Screenshots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four hand-maintained landing-page demo screenshots with an automated Playwright job that re-captures them from a seeded demo account and opens a reviewable PR.

**Architecture:** A standalone Playwright script (TypeScript, run via `npx tsx`) logs into a dedicated `chat.librechat.ai` demo account whose content is seeded once via direct DB access (no AI credits), then captures four variants (desktop/mobile x light/dark) and overwrites the existing image files in place so `Hero.tsx` is untouched. A scheduled GitHub Action runs the script and opens a PR via `peter-evans/create-pull-request` for human review of the rendered image diff.

**Tech Stack:** Playwright (already a dependency), TypeScript via `npx tsx`, Vitest (unit tests for pure config), GitHub Actions, pnpm.

## Global Constraints

- Node `>=20.19.0`; package manager `pnpm@9.5.0`.
- **No new npm dependency.** `playwright` (`^1.58.2`) is already installed; the script runs via `npx tsx`, mirroring the existing `scripts/translate.ts` (`"translate": "npx tsx scripts/translate.ts"`).
- Output files must keep these exact paths and must remain the only four written: `components/home/img/demo_light.png`, `components/home/img/demo_dark.png`, `components/home/img/demo_mobile_light.png`, `components/home/img/demo_mobile_dark.png`.
- `components/home/Hero.tsx` must remain unchanged.
- Unit tests must live under `scripts/**/*.test.ts` (the Vitest `include` glob in `vitest.config.ts`).
- Use the `playwright` library directly, **not** `@playwright/test`. The repo's `playwright.config.ts` (`testDir: ./e2e`) auto-starts the local docs server and targets localhost; this script targets the external demo and must stay independent of that harness.
- CI conventions (match existing workflows): `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4` with `node-version: 20` and `cache: pnpm`, `pnpm install --frozen-lockfile`, `pnpm exec playwright install --with-deps chromium`.
- Secrets/variables: `DEMO_EMAIL`, `DEMO_PASSWORD`, `DEMO_CONVERSATION_ID` (repo secrets); `DEMO_BASE_URL` (repo variable).
- Commit messages: natural, no AI attribution.
- If any dependency change touches the lockfile, regenerate it against `https://registry.npmjs.org/` so the internal registry URL never leaks.

## File Structure

- `scripts/screenshots/config.ts` — pure config and helpers (variant matrix, output-path resolver, theme bootstrap). Unit-tested.
- `scripts/screenshots/config.test.ts` — Vitest unit tests for the config module.
- `scripts/screenshots/capture.ts` — standalone Playwright runner (login, loop variants, screenshot, write files).
- `scripts/screenshots/README.md` — Stage A (one-time DB seed) checklist, required secrets/variables, local-run instructions, selector-verification notes.
- `.github/workflows/update-screenshots.yml` — scheduled + manual workflow that runs the script and opens a PR.
- `package.json` — add the `screenshots` script (no dependency change).

---

### Task 1: Screenshot config module + unit tests

**Files:**
- Create: `scripts/screenshots/config.ts`
- Test: `scripts/screenshots/config.test.ts`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces:
  - `BASE_URL: string` (`'https://chat.librechat.ai'`)
  - `ZOOM: number` (`1.1`)
  - `THEME_STORAGE_KEY: string` (`'theme'`)
  - `IMG_DIR: string` (absolute path to `components/home/img`)
  - `type Theme = 'light' | 'dark'`, `type Device = 'desktop' | 'mobile'`
  - `interface Variant { name: string; device: Device; theme: Theme; viewport: { width: number; height: number }; deviceScaleFactor: number; outputFile: string }`
  - `VARIANTS: Variant[]` (exactly 4 entries)
  - `outputPath(variant: Variant): string`
  - `themeBootstrap(theme: Theme): string`

- [ ] **Step 1: Write the failing test**

Create `scripts/screenshots/config.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { VARIANTS, outputPath, themeBootstrap, THEME_STORAGE_KEY } from './config'

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
    const p = outputPath(VARIANTS[0])
    expect(p).toMatch(/components\/home\/img\/demo_light\.png$/)
  })

  it('builds a theme bootstrap snippet for each theme', () => {
    expect(themeBootstrap('dark')).toContain('"dark"')
    expect(themeBootstrap('light')).toContain('"light"')
    expect(themeBootstrap('dark')).toContain(THEME_STORAGE_KEY)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run scripts/screenshots/config.test.ts`
Expected: FAIL — `Failed to resolve import "./config"` (module does not exist yet).

- [ ] **Step 3: Write the minimal implementation**

Create `scripts/screenshots/config.ts`:

```ts
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

/**
 * Returns a JS snippet (string) to run as a Playwright init script, forcing the
 * LibreChat theme before app code reads it. THEME_STORAGE_KEY is the best-known
 * default; verify it against the live demo in Task 2 and adjust if needed.
 */
export function themeBootstrap(theme: Theme): string {
  return `try{localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)}, ${JSON.stringify(theme)})}catch(e){}`
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run scripts/screenshots/config.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors from the new files.

- [ ] **Step 6: Commit**

```bash
git add scripts/screenshots/config.ts scripts/screenshots/config.test.ts
git commit -m "feat: add screenshot capture config and tests"
```

---

### Task 2: Capture script, npm script, and README

**Files:**
- Create: `scripts/screenshots/capture.ts`
- Create: `scripts/screenshots/README.md`
- Modify: `package.json` (add `screenshots` script under `"scripts"`)

**Interfaces:**
- Consumes from Task 1: `BASE_URL`, `ZOOM`, `VARIANTS`, `Variant`, `outputPath`, `themeBootstrap`.
- Produces: the executable `pnpm screenshots` command that writes the four PNGs.

**Prerequisite:** Stage A (seed the demo account) must be done before the verification step. The README written in this task documents Stage A; the human performs it with DB access.

- [ ] **Step 1: Add the `screenshots` script to `package.json`**

In the `"scripts"` block, add this line (next to `"translate"`):

```json
    "screenshots": "npx tsx scripts/screenshots/capture.ts",
```

- [ ] **Step 2: Write the capture script**

Create `scripts/screenshots/capture.ts`:

```ts
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
```

- [ ] **Step 3: Write the README**

Create `scripts/screenshots/README.md`:

```markdown
# Landing-page demo screenshots

Regenerates the four hero images in `components/home/img/` from the live
LibreChat demo. `components/home/Hero.tsx` imports these files directly, so the
script just overwrites them in place.

## Stage A — one-time demo-account seed (manual, needs DB access)

Done once so the recurring job has rich, on-message content to shoot. Use direct
DB access to insert fabricated assistant replies (no AI credits spent).

Seed the dedicated demo account so it shows:

- [ ] The **LibreChat agent** selected/active as the endpoint.
- [ ] Several conversations, each using a **different provider** (e.g. OpenAI,
      Anthropic, Google), so multi-provider is visible in the sidebar.
- [ ] **2 projects.**
- [ ] **2-3 pinned models/agents.**
- [ ] One primary conversation chosen as the hero shot. Record its id; it becomes
      `DEMO_CONVERSATION_ID`.

If the account is ever wiped, repeat this checklist.

## Stage B — recurring capture (automated)

`pnpm screenshots` logs into the seeded account and re-shoots all four variants
against the demo's current UI.

### Required env

| Name | Where | Purpose |
| --- | --- | --- |
| `DEMO_EMAIL` | secret / `.env.local` | demo account login |
| `DEMO_PASSWORD` | secret / `.env.local` | demo account password |
| `DEMO_CONVERSATION_ID` | secret / `.env.local` | hero conversation id |
| `DEMO_BASE_URL` | variable / `.env.local` (optional) | defaults to `https://chat.librechat.ai` |

### Run locally

```bash
# .env.local (gitignored) holds the values above
set -a && source .env.local && set +a
pnpm screenshots
```

The four PNGs in `components/home/img/` will be overwritten. Review them, then
preview in the hero with `pnpm dev`.

### Selectors

`scripts/screenshots/capture.ts` contains the login-form and message selectors and
the theme `localStorage` key. If the demo's markup changes, update `SELECTORS` and
`THEME_STORAGE_KEY` (in `config.ts`). Discover current values with the
`agent-browser` CLI or browser devtools against the live demo.
```

- [ ] **Step 4: Verify selectors and theme key against the live demo, then run**

This script targets a third-party app, so the login/message selectors and the theme
`localStorage` key must be confirmed before trusting the script.

1. Confirm the login form field names and submit button:

   Run: `agent-browser open https://chat.librechat.ai/login && agent-browser snapshot -i`
   Expected: the snapshot lists the email/password inputs and submit button. If their
   `name`/selectors differ from `SELECTORS` in `capture.ts`, update `SELECTORS`.

2. After a manual login to the seeded account, confirm the message-area selector and
   the theme key:

   In devtools console on a `/c/<id>` page run `Object.keys(localStorage)` and inspect
   which key holds the theme value and what the dark/light values are. If they differ
   from `THEME_STORAGE_KEY` / the values in `config.ts`, update `config.ts`.

3. With Stage A complete and `.env.local` populated, run the capture:

   Run: `set -a && source .env.local && set +a && pnpm screenshots`
   Expected: console prints `captured desktop-light`, `captured desktop-dark`,
   `captured mobile-light`, `captured mobile-dark`, exit code 0.

4. Confirm only the four expected files changed:

   Run: `git status --porcelain components/home/img`
   Expected: only `demo_light.png`, `demo_dark.png`, `demo_mobile_light.png`,
   `demo_mobile_dark.png` appear as modified.

- [ ] **Step 5: Visually verify in the hero**

Run: `pnpm dev` then, in another shell:
`agent-browser open http://localhost:3333 && agent-browser wait --load networkidle && agent-browser screenshot`
Then dark mode: `agent-browser --color-scheme dark open http://localhost:3333 && agent-browser screenshot`
Expected: the hero shows the new desktop screenshots in both themes with no layout shift; resize/emulate mobile to confirm the portrait mobile images render.

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/screenshots/capture.ts scripts/screenshots/README.md package.json components/home/img
git commit -m "feat: add automated demo screenshot capture script"
```

---

### Task 3: Scheduled GitHub Actions workflow

**Files:**
- Create: `.github/workflows/update-screenshots.yml`

**Interfaces:**
- Consumes: the `pnpm screenshots` command from Task 2; repo secrets/variables.
- Produces: a scheduled + manually dispatchable workflow that opens a PR with refreshed images.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/update-screenshots.yml`:

```yaml
name: Update demo screenshots

on:
  schedule:
    - cron: '0 6 * * 1' # Mondays 06:00 UTC
  workflow_dispatch:

concurrency:
  group: update-screenshots
  cancel-in-progress: false

permissions:
  contents: write
  pull-requests: write

jobs:
  screenshots:
    name: Capture and open PR
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        name: Install pnpm

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Capture screenshots
        run: pnpm screenshots
        env:
          DEMO_EMAIL: ${{ secrets.DEMO_EMAIL }}
          DEMO_PASSWORD: ${{ secrets.DEMO_PASSWORD }}
          DEMO_CONVERSATION_ID: ${{ secrets.DEMO_CONVERSATION_ID }}
          DEMO_BASE_URL: ${{ vars.DEMO_BASE_URL }}

      - name: Open pull request
        uses: peter-evans/create-pull-request@v6
        with:
          branch: chore/update-demo-screenshots
          base: main
          commit-message: 'chore: update landing page demo screenshots'
          title: 'chore: update landing page demo screenshots'
          body: |
            Automated refresh of the landing-page hero screenshots from the live demo.

            Review the rendered image diff below before merging. No changes means the
            UI has not visibly shifted since the last run.
          add-paths: |
            components/home/img/demo_light.png
            components/home/img/demo_dark.png
            components/home/img/demo_mobile_light.png
            components/home/img/demo_mobile_dark.png
          delete-branch: true
```

- [ ] **Step 2: Validate the YAML syntax**

Run: `npx --yes js-yaml .github/workflows/update-screenshots.yml > /dev/null && echo OK`
Expected: prints `OK` (the file parses as valid YAML).

- [ ] **Step 3: Configure repo secrets and variables (human step)**

```bash
gh secret set DEMO_EMAIL
gh secret set DEMO_PASSWORD
gh secret set DEMO_CONVERSATION_ID   # the hero conversation id from Stage A
gh variable set DEMO_BASE_URL --body "https://chat.librechat.ai"   # optional
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/update-screenshots.yml
git commit -m "ci: add scheduled landing page screenshot workflow"
```

- [ ] **Step 5: Smoke-test via manual dispatch (after secrets are set)**

Run: `gh workflow run "Update demo screenshots"`
Then: `gh run watch`
Expected: the job succeeds and a PR titled "chore: update landing page demo screenshots"
is opened (or shows "no changes" if the UI is identical). Review the image diff in the PR.

---

## Notes and risks

- **`npx tsx` in CI:** mirrors the existing `scripts/translate.ts` invocation. If fetching
  `tsx` at runtime proves flaky in CI, add `tsx` as a devDependency and regenerate the
  lockfile against `https://registry.npmjs.org/`.
- **Third-party selectors:** the login/message selectors and theme key are the only
  fragile parts. They are isolated (`SELECTORS` in `capture.ts`, `THEME_STORAGE_KEY` in
  `config.ts`) and verified in Task 2, Step 4.
- **Default `GITHUB_TOKEN`:** PRs opened by the default token do not themselves trigger
  further workflows; acceptable for an image-only PR. If CI must run on the PR, swap to a
  PAT in the `create-pull-request` step later.
```
