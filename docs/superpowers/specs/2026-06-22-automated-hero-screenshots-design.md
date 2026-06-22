# Automated Hero Screenshots — Design

**Date:** 2026-06-22
**Status:** Approved (pending spec review)
**Author:** Marco Beretta

## Problem

The landing-page hero (`components/home/Hero.tsx`) shows the LibreChat app via four
hand-made PNGs imported directly into the component:

- `components/home/img/demo_light.png`
- `components/home/img/demo_dark.png`
- `components/home/img/demo_mobile_light.png`
- `components/home/img/demo_mobile_dark.png`

Every LibreChat UI change means re-shooting and re-cropping all four by hand
(desktop/mobile, light/dark). The team cannot keep these current, so the hero drifts
out of date.

## Goal

Keep showing the **real** LibreChat UI while reducing the per-update manual effort to
zero. Screenshots regenerate automatically and land in a reviewable PR.

## Non-goals

- Not recreating the UI in CSS/React (rejected: we want the literal product).
- Not embedding a live iframe (rejected: heavy, fragile, interactive in a hero).
- Not a looping video (rejected: re-recording stays manual, theming unsolved).
- Not changing the hero layout or the four image filenames/aspect ratios.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Representation | Automated real screenshots via Playwright |
| Trigger | Scheduled GitHub Action (weekly cron) + manual `workflow_dispatch`, opens a PR |
| Content | Curated conversations on a dedicated demo account |
| Capture source | Logged-in demo account on `chat.librechat.ai`, full app view |
| Login risk | None. The demo has no captcha and will not add one |
| Content creation | One-time DB seed (fabricated replies, no AI credits); recurring cron only re-captures |
| Secrets in CI | Login credentials only. DB access is used once at setup, never in the cron |
| Component change | None. The script overwrites the same four files in place |

## Architecture

Two stages with different cadences and different access needs.

### Stage A — Setup (one-time, manual, uses DB access)

Populate the demo account so the captured frames show a rich, on-message product. Done
once with direct DB access so no AI credits are spent; assistant replies are fabricated
mock content inserted into the DB.

Curated state to seed:

- The **LibreChat agent** selected/active as the endpoint.
- Several conversations, each using a **different provider** (e.g. OpenAI, Anthropic,
  Google) so the multi-provider story is visible in the sidebar and message metadata.
- **2 projects.**
- **2–3 pinned models/agents.**
- A primary conversation chosen as the hero shot, reachable at a stable route
  (`/c/<conversationId>`).

This stage is documented as a checklist (not committed as a CI-run seed script), so the
recurring automation never needs DB credentials. If the account is ever wiped, re-seed
by hand from the checklist.

### Stage B — Capture (recurring, automated, uses login secrets only)

A Playwright script logs into the seeded account and re-shoots the same content against
whatever the demo's UI currently looks like. The conversations are static; only the UI
evolves, which is exactly when fresh screenshots are wanted.

## Components

### 1. Capture script — `scripts/screenshots/capture.ts`

Standalone TypeScript script run via `npx tsx` (mirroring the existing
`scripts/translate.ts`). Playwright (`playwright` / `@playwright/test`) is already a
project dependency, so **no new deps**. It uses the `playwright` library directly, not
the `@playwright/test` runner, because the repo's `@playwright/test` config (`testDir:
./e2e`) auto-starts the local docs server and points at localhost; our target is the
external `chat.librechat.ai`, so it must stay independent of that harness.

Pure configuration and helpers (the variant matrix, output-path resolver, theme
bootstrap snippet) live in a sibling `scripts/screenshots/config.ts` so they can be
unit-tested by Vitest (`scripts/**/*.test.ts` is in the Vitest `include` glob).

Inputs (env):

- `DEMO_EMAIL`, `DEMO_PASSWORD` — demo account login.
- `DEMO_CONVERSATION_ID` — the curated hero conversation id (default baked in as a
  non-secret constant, overridable via env).
- `DEMO_BASE_URL` — defaults to `https://chat.librechat.ai`.

Behaviour:

1. Launch Chromium, log in once, persist `storageState`, reuse it for every variant.
2. For each of four variants (desktop/mobile x light/dark):
   - Set viewport and `deviceScaleFactor: 2` for crisp retina output.
   - Apply a slight page **zoom** (configurable, default ~1.1) for legibility.
   - Force the theme deterministically via `localStorage.theme`, then reload.
   - Navigate to `/c/<DEMO_CONVERSATION_ID>`.
   - Wait on stable signals (last assistant message rendered, web fonts loaded,
     network idle). No fixed sleeps.
   - Inject CSS to disable animations/transitions and hide the text caret.
   - Capture with a fixed `clip` / element screenshot so framing and cropping are
     identical every run (this replaces today's manual crop).
   - Write the PNG to the existing `components/home/img/<name>.png` path.
3. Output dimensions/aspect match the current files so `Hero.tsx` needs no change.
4. On any failure (login, selector timeout) exit non-zero so no broken capture ships.
   One retry wraps the capture loop to absorb transient flakiness.

Variant matrix (aspect preserved from current assets). Current files are:
desktop ~2546x1428 (≈16:9), mobile ~512x1117 (portrait, ≈ iPhone 390x844 ratio):

| Variant | Viewport (logical) | DSF | Output target |
| --- | --- | --- | --- |
| desktop light | 1280x720 | 2 | `demo_light.png` |
| desktop dark | 1280x720 | 2 | `demo_dark.png` |
| mobile light | 390x844 (phone portrait) | 2 | `demo_mobile_light.png` |
| mobile dark | 390x844 (phone portrait) | 2 | `demo_mobile_dark.png` |

The current mobile assets are **portrait phone shots**, so the script captures a phone
viewport in portrait. Exact output pixel sizes may differ from today's files, but the
aspect ratios match, and the hero renders with `object-cover` inside `max-w` containers,
so no layout shift results. The viewport numbers are starting points to tune during
implementation against the live demo.

### 2. Workflow — `.github/workflows/update-screenshots.yml`

Triggers: weekly `schedule` cron + `workflow_dispatch` (manual Run button).

Steps:

1. Checkout.
2. Setup Node + pnpm, install deps.
3. `pnpm exec playwright install --with-deps chromium` (pinned browser version).
4. Run `pnpm screenshots` with `DEMO_EMAIL` / `DEMO_PASSWORD` from GitHub secrets.
5. If `git status --porcelain` shows changes, open/update a PR via
   `peter-evans/create-pull-request` on a fixed branch `chore/update-demo-screenshots`.
   The PR diff renders the before/after images for human review before merge.

Guards: `concurrency` group to prevent overlapping runs; pinned Playwright +
browser versions for reproducibility.

### 3. `package.json`

- No new dependency (`playwright` and `tsx`-via-`npx` are already in use).
- Add script: `"screenshots": "npx tsx scripts/screenshots/capture.ts"` (mirrors the
  existing `"translate": "npx tsx scripts/translate.ts"`).

(If any dependency change does touch the lockfile, regenerate it against the public npm
registry so the internal registry URL never leaks.)

### 4. Local iteration

`pnpm screenshots` with a gitignored `.env.local` holding demo creds, to tune framing
and zoom before trusting CI.

## Secrets

- GitHub repo secrets: `DEMO_EMAIL`, `DEMO_PASSWORD`. Use a dedicated demo account, not
  an admin. These are the only secrets the recurring job needs.
- DB connection is used only at Stage A setup, by a human, never stored in CI.

## Error handling & reliability

- Login automation is safe (no captcha by policy).
- Hard-fail on any capture error so a broken/ugly frame never reaches a PR.
- The PR-review gate means a human always eyeballs the rendered images before merge.
- Re-using `storageState` keeps logins infrequent.

## Verification

After the first capture:

1. Run `pnpm dev`.
2. View the hero at desktop and mobile widths in both themes (agent-browser).
3. Confirm framing, zoom, and that no layout shift was introduced versus the old assets.

## Open follow-ups (not in scope)

- Triggering the workflow on LibreChat release tags in addition to the weekly cron.
- Optional PNG optimization pass (the repo already has `scripts/optimize-images.mjs`).
