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

### Cloudflare Bot Fight Mode must stay off

Bot Fight Mode challenges this job. It served `/api/config` a managed challenge
from GitHub Actions egress (`cf-mitigated: challenge`, body `Just a moment...`,
no `via: 1.1 Caddy`, so the origin never saw it), and because the SPA fetches
its startup config over XHR, which cannot solve a JS challenge, the app rendered
"There was an internal server error" and there was nothing to capture. The same
requests from a residential IP returned 200.

Bot Fight Mode cannot be worked around from this repo. Per Cloudflare's docs it
does not run on the Ruleset Engine, so WAF custom rules with a Skip action have
no effect on it, and it is zone-wide with no hostname or path scoping. A skip
rule keyed on a secret header was tried and matched 162 times without stopping
the challenge.

If it is ever re-enabled, this job breaks again. The options are to upgrade the
zone to Pro, where Super Bot Fight Mode does support Skip rules, or to stop
capturing against the live demo.

Do not reach for `extraHTTPHeaders` to smuggle a bypass token: Playwright
applies it to every request including cross-origin ones, which makes them
preflighted, and third parties reject the unknown header.

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
succeeds. If that request is blocked, the page loads instantly and then no form
ever appears, which surfaces as a selector timeout that says nothing about the
real cause.

For every failed attempt the script writes to `screenshot-diagnostics/`:

| File                       | Contents                                                    |
| -------------------------- | ----------------------------------------------------------- |
| `<label>-attempt-<n>.png`  | full-page screenshot of what the browser actually saw       |
| `<label>-attempt-<n>.html` | the served DOM                                              |
| `<label>-attempt-<n>.txt`  | URL, title, visible text, `/api/*` statuses, console errors |

The `.txt` also carries a **who rejected the boot-blocking request** section with
the headers and body of the first rejected `/api/config`. Read it first: `via:
1.1 Caddy` means the demo's own origin answered and the limit lives in
LibreChat's config, while `cf-ray` plus `cf-mitigated` and no `via` means
Cloudflare generated it and the fix belongs in the zone's WAF rules.

The report is printed to stderr too, and when a boot-blocking request failed the
reason is appended to the thrown error. The workflow uploads the directory as a
`screenshot-diagnostics` artifact on failure.

The script sends a normal desktop user agent rather than Playwright's default
`HeadlessChrome` token. That is hygiene only — a CI run with a clean user agent
still gets challenged, so the user agent is not what triggers the block.
