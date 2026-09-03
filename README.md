<p align="center">
  <a href="https://www.librechat.ai">
    <img src="public/librechat.png" alt="LibreChat" width="120" height="120">
  </a>
</p>

<h1 align="center">LibreChat Documentation</h1>

<p align="center">
  The official documentation, blog, and changelog for
  <a href="https://github.com/danny-avila/LibreChat">LibreChat</a>,
  the open-source, self-hostable AI chat platform.
</p>

<p align="center">
  <a href="https://www.librechat.ai"><strong>Visit www.librechat.ai »</strong></a>
</p>

<p align="center">
  <a href="https://www.librechat.ai"><img src="https://img.shields.io/badge/Website-librechat.ai-2563EB?logo=googlechrome&logoColor=white" alt="Website"></a>
  <a href="https://deepwiki.com/LibreChat-AI/librechat.ai"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
  <a href="https://discord.librechat.ai"><img src="https://img.shields.io/discord/1086345563026489514?logo=discord&logoColor=white&label=Discord&color=5865F2" alt="Discord"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-22C55E" alt="License: MIT"></a>
</p>

---

## What's New in LibreChat v0.8.8-rc2

- **Agent run control:** Interrupt an Agent before visible answer text, steer runs with files and quoted excerpts, durably queue follow-ups, and recover saved partial work with **Keep going** or **Answer now**.
- **Agent activity:** Optional generated labels group reasoning and tool work, summarize multi-step phases, and show the current reasoning direction.
- **Human-in-the-loop Agents:** Stream up to four related questions, pause for input or tool approval, and resume durably.
- **Unified Agent Builder:** Configure Skills, MCP, Code Interpreter, orchestration, Programmatic Tool Calling, model-spec controls, and per-tool background and intent settings in one Tools marketplace; Skills can be enabled for standalone runtime authoring without exposing the existing catalog.
- **Durable Agent automation:** Authenticated Agent Events support bound child actors, expected-action receipts, per-actor mailboxes, event batching, durable human pauses, and automatic detached Actions across built-in stream stores.
- **Deeper Subagent history:** Browse branch-aware child turns with bounded reasoning and stable live event views, load earlier activity, inspect event details, continue completed child chats, and automatically wake saved parent Agents when detached work settles.
- **Background tools:** Eligible Code Interpreter, MCP, Plugin, and Action tools can run while an Agent keeps working, with automatic delivery for supported completions and polling controls when needed.
- **Code Interpreter workflows:** Sandbox images return as viewable artifacts; highly experimental stateful sessions add scoped managed, attached, or personal environments, per-message file downloads, and guarded file-write and command permissions.
- **Agent extensibility:** Experimental Agent Plugins bundle deployment Skills, MCP servers, and opt-in command hooks; saved Agent teams run as isolated Subagent graphs.
- **Scheduled Chats (experimental):** Run saved Agents with presets or custom cron, selectable time zones, multi-day weekly cadence, and optional Chat Project destinations.
- **Memory and context:** Agents can use optionally isolated memory, preserve adaptive context fading across turns, and show categorized current-window usage, tokens, and optional cost.
- **Editable long pastes:** Long pasted text becomes an editable attachment that can be moved back into the composer; attachment-only turns and reliable Upload as Text downloads are also supported.
- **Projects, settings, and navigation:** Search conversation titles and message contents, manage project chats, use searchable settings and shortcuts, pin chats, choose clock/week conventions, and navigate faster on mobile.
- **Sharing and artifacts:** Stable shared links support personal copies; fullscreen previews, Mermaid export, PowerPoint templates, shell scripts, and original Office downloads expand file workflows.
- **Web search:** Keenable adds keyless search and page fetch, while SearXNG and Tavily gain richer controls and all web-tool egress uses stronger SSRF protection.
- **Security and authentication:** Default HTTP security headers, opt-in nonce CSP, authenticated local images, per-user Code Interpreter JWTs, stable SAML identity binding, live-session OpenID token refresh, and retired JWT-secret rejection harden deployments.
- **Models and reasoning:** Added GPT-5.6 with Responses reasoning controls, Claude Fable 5.1, Opus 5, and Sonnet 5, plus Gemini 3.8/3.7/3.6 Flash and Gemini 3.5 Flash-Lite.
- **Langfuse observability:** Configure encrypted in-app connections, tenant fanout, authenticated gateways, export-decision telemetry, and authorized session links in chats and shared views.
- **Administration:** Source-aware content filters can audit or block model-bound data, while tenant Insights, delegated configuration, encrypted secrets, and expiring violation scores improve operations.
- **Streaming and reliability:** Adaptive smoothing, Redis delta batching and failover recovery, automatic generation protocol v2, live MCP catalog refresh, Agent circuit breakers, and DocumentDB support improve long runs and scaled deployments.

Read the [full v0.8.8-rc2 changelog](https://www.librechat.ai/changelog/v0.8.8-rc2).

---

This repository powers **[www.librechat.ai](https://www.librechat.ai)**: the docs, guides, blog, and changelog for LibreChat. It is a [Next.js](https://nextjs.org) application built on [Fumadocs](https://fumadocs.dev), with content authored in MDX.

> Looking for the LibreChat app itself? It lives at **[danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)**. Open code and product issues there, and documentation issues here.

## Table of Contents

- [What's New in LibreChat v0.8.8-rc2](#whats-new-in-librechat-v088-rc2)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Writing Documentation](#writing-documentation)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [Community & Support](#community--support)
- [License](#license)

## Features

- 📚 **Complete documentation** covering setup, configuration, deployment, and every LibreChat feature.
- 📝 **Blog & changelog** authored in MDX, with release notes and long-form articles.
- 🤖 **Ask AI** — an in-page assistant (Vercel AI SDK + [OpenRouter](https://openrouter.ai)) that answers questions grounded in the docs.
- 🔍 **Instant search** — fast, fully client-side full-text search powered by [Orama](https://orama.com), with a prebuilt static index per language.
- 🌍 **14 languages** — English source with translations (中文, Español, Français, Deutsch, 日本語, Português, Italiano, Nederlands, Polski, Tiếng Việt, 한국어, Bahasa Indonesia, Türkçe), including dedicated tokenizers for CJK, Korean, Polish, and Vietnamese search.
- 🎨 **Polished UI** — responsive, accessible, light/dark themes out of the box via Fumadocs UI.
- ⚡ **Static-first & fast** — per-locale prebuilt search indexes, optimized images, and dynamic Open Graph images.
- 🔒 **Privacy-friendly** — cookieless, self-hosted analytics with no tracking banners.

## Tech Stack

| Layer           | Technology                                                                |
| --------------- | ------------------------------------------------------------------------- |
| Framework       | [Next.js](https://nextjs.org) 16 (App Router), React 19                   |
| Docs engine     | [Fumadocs](https://fumadocs.dev) (core, ui, mdx)                          |
| Content         | MDX                                                                       |
| Styling         | [Tailwind CSS](https://tailwindcss.com) v4                                |
| Search          | [Orama](https://orama.com) (static, per-locale index)                     |
| Ask AI          | [Vercel AI SDK](https://ai-sdk.dev) + [OpenRouter](https://openrouter.ai) |
| Rate limiting   | [Upstash](https://upstash.com) Redis                                      |
| Icons           | [Lucide](https://lucide.dev)                                              |
| Testing         | [Vitest](https://vitest.dev)                                              |
| Tooling         | ESLint, Prettier, Husky                                                   |
| Package manager | [pnpm](https://pnpm.io)                                                   |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) **22.x–24.x** (CI and production run 24)
- [pnpm](https://pnpm.io) **9.5+**

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/LibreChat-AI/librechat.ai.git
cd librechat.ai

# 2. (Optional) create a local env file for Ask AI, rate limiting, etc.
cp .env.template .env.local

# 3. Install dependencies
pnpm install

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3333](http://localhost:3333) to view the site.

> Environment variables are optional for local docs work. You only need to fill in `.env.local` to exercise features like Ask AI or rate limiting. Always run `pnpm build` before opening a PR to catch build errors early.

### Web Bot Auth

Generate an Ed25519 signing key, then copy the printed assignment into `.env.local`:

```bash
pnpm web-bot-auth:keygen
```

In the production secret manager, store the JSON between the single quotes as the `WEB_BOT_AUTH_PRIVATE_JWK` value.

Set `WEB_BOT_AUTH_AGENT_ORIGIN` when the public site origin is not `https://www.librechat.ai`. The app publishes the corresponding public JWKS at `/.well-known/http-message-signatures-directory` and signs requests from the docs AI agent. The directory returns `503` and agent requests fail closed until the private key is configured, so a deployment cannot advertise an empty key set or silently send unsigned agent traffic.

## Project Structure

```
app/                # Next.js App Router: docs, blog, changelog pages + API routes
  api/
    chat/           # "Ask AI" endpoint (OpenRouter via the Vercel AI SDK)
    search/         # Per-locale static Orama search index
content/
  docs/             # Documentation pages (MDX), organized by section
  blog/             # Blog posts (MDX)
  changelog/        # Changelog entries (MDX)
components/         # React components (home, UI, icons, search dialog, etc.)
lib/                # Utilities: content sources, i18n, search, MDX components
public/             # Static assets (images, videos, icons)
scripts/            # Build, translation, and image-optimization scripts
source.config.ts    # Fumadocs content collections config
```

## Writing Documentation

Docs live in `content/docs/` and are grouped by section. Each directory has a `meta.json` that controls sidebar navigation and ordering:

```json
{
  "title": "Section Title",
  "icon": "Wrench",
  "pages": ["index", "page-one", "page-two"]
}
```

Only pages listed in the `pages` array appear in the sidebar, in the order given.

**Localization:** English (`.mdx`) is the source of truth. Translated pages use a locale suffix (for example `index.es.mdx`), and each locale's search index only includes pages that have a real translated file. Keep new content in English and let the translation workflow handle the rest.

## Available Scripts

| Command                    | Description                                   |
| -------------------------- | --------------------------------------------- |
| `pnpm dev`                 | Start the dev server on port 3333             |
| `pnpm build`               | Production build                              |
| `pnpm start`               | Start the production server on port 3333      |
| `pnpm lint`                | Run ESLint (zero warnings allowed)            |
| `pnpm lint:prettier`       | Check formatting with Prettier                |
| `pnpm prettier`            | Format the codebase with Prettier             |
| `pnpm typecheck`           | Generate MDX types and run `tsc --noEmit`     |
| `pnpm test`                | Run the Vitest suite                          |
| `pnpm test:watch`          | Run Vitest in watch mode                      |
| `pnpm analyze`             | Build and analyze the production bundle size  |
| `pnpm optimize:images`     | Optimize images in `public/`                  |
| `pnpm web-bot-auth:keygen` | Generate an Ed25519 Web Bot Auth private JWK  |
| `pnpm translate`           | Generate translations from the English source |

## Contributing

Contributions are welcome, from fixing a typo to writing a whole new guide.

1. Fork the repo and create a branch from `main`.
2. Make your changes and preview them locally with `pnpm dev`.
3. Before opening a PR, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
4. Open a pull request describing what you changed and why.

For questions about the documentation, join the [Discord](https://discord.librechat.ai). For issues with the LibreChat application itself, please use the [main repository](https://github.com/danny-avila/LibreChat).

## Community & Support

- 🌐 **Website:** [www.librechat.ai](https://www.librechat.ai)
- 💬 **Discord:** [discord.librechat.ai](https://discord.librechat.ai)
- 🧠 **Ask DeepWiki:** [deepwiki.com/LibreChat-AI/librechat.ai](https://deepwiki.com/LibreChat-AI/librechat.ai)
- 🚀 **Main app:** [danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)

## License

Released under the [MIT License](./LICENSE).
