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
| `DEMO_CONVERSATION_ID` | variable / `.env.local` | hero conversation id |
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
