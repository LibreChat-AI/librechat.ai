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

The GitHub workflow runs in the `Production` Environment, so define these
secrets/variables there.

| Name                   | Where                              | Purpose                                 |
| ---------------------- | ---------------------------------- | --------------------------------------- |
| `DEMO_EMAIL`           | secret / `.env.local`              | demo account login                      |
| `DEMO_PASSWORD`        | secret / `.env.local`              | demo account password                   |
| `DEMO_CONVERSATION_ID` | secret / `.env.local`              | hero conversation id                    |
| `DEMO_BASE_URL`        | variable / `.env.local` (optional) | defaults to `https://chat.librechat.ai` |

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

The theme key must match the one LibreChat reads (`color-theme`, set by the inline
script in its `client/index.html`). Writing any other key silently leaves both
variants on the app's `system` default, so the light and dark shots come out
identical rather than failing loudly.

### Debugging a failed run

The demo is a SPA that only renders the login form after `GET /api/config`
succeeds. If that request is blocked (a CDN bot rule rejecting the runner's egress
IP is the usual cause), the page loads instantly and then no form ever appears —
which shows up as a selector timeout that says nothing about the real cause.

For every failed attempt the script writes to `screenshot-diagnostics/`:

| File                       | Contents                                                    |
| -------------------------- | ----------------------------------------------------------- |
| `<label>-attempt-<n>.png`  | full-page screenshot of what the browser actually saw       |
| `<label>-attempt-<n>.html` | the served DOM                                              |
| `<label>-attempt-<n>.txt`  | URL, title, visible text, `/api/*` statuses, console errors |

It also prints that report to stderr and, when a critical API request failed,
appends the reason to the thrown error. The workflow uploads the directory as a
`screenshot-diagnostics` artifact on failure.

The script sends a normal desktop user agent rather than Playwright's default
`HeadlessChrome` token, since the latter is what gets `/api/config` rejected from
CI egress IPs.
