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

## What's New in LibreChat v0.8.8-rc1

- **Agent run control:** Interrupt or steer an Agent mid-run, queue follow-up messages, and reclaim, edit, or escalate pending steers.
- **Human-in-the-loop Agents:** Agents stream question progress, ask up to four related questions in one form, pause for input or tool approval, and resume.
- **Unified Agent Builder:** A redesigned Tools marketplace brings together Skills, MCP, Code Interpreter, orchestration, Programmatic Tool Calling, model-spec controls, and per-tool background and intent settings.
- **Readable Agent activity:** Generated activity-group headers, parent phase summaries, and live tool intent labels make long reasoning and tool runs easier to scan.
- **Code Interpreter workflows:** Code and shell tools can run in the background, sandbox images return as viewable artifacts, and highly experimental stateful sessions can reuse prewarmed conversation workspaces.
- **Agent extensibility:** Experimental Agent Plugins can bundle deployment Skills, MCP servers, and opt-in command hooks, while explicit subagents initialize only when selected.
- **Memory, context, and identity:** Agents can manage memory with optional per-agent isolation, expose support contacts safely, and show a more faithful Context Usage gauge.
- **Sharing and files:** Shared conversations show a badge and update at a stable URL, while signed-in viewers can continue them as personal copies.
- **Artifact workflows:** Open previews fullscreen, work with PowerPoint `.potx` templates across upload, search, and code execution, upload shell scripts across common MIME variants, export Mermaid diagrams as SVG or PNG, and download original Office files from the artifact panel.
- **Models and reasoning:** Added GPT-5.6 with Responses API reasoning controls, Claude Opus 5 and Sonnet 5, Gemini 3.7 and 3.6 Flash, and Gemini 3.5 Flash-Lite.
- **Langfuse observability:** Configure encrypted Langfuse connections in-app, let authorized admins open sampled sessions directly, optionally fan out traces by tenant, and suppress central export per run.
- **Administration and security:** Delegate config sections, encrypt registered secrets, enforce SSRF checks for speech, OCR, and web tools, and generate unique temporary credentials when secrets are blank.
- **Messages and navigation:** Right-aligned user turns, unified multi-part editing, full-message copy, a dock-style message rail, virtualized search, smooth streaming, and faster Agent startup.
- **Streaming and tool reliability:** Adaptive provider smoothing, Redis delta batching, dynamic MCP tool refresh, parsed MCP response media types, runtime OAuth recovery, and Agent stream circuit breakers improve long-running workflows.
- **Deployment and reliability:** Added configurable HTTP timeouts, Amazon DocumentDB 5.0+ support, low-noise Redis and browser observability, and a rolling-upgrade-safe generation protocol.

Read the [full v0.8.8-rc1 changelog](https://www.librechat.ai/changelog/v0.8.8-rc1).

---

This repository powers **[www.librechat.ai](https://www.librechat.ai)**: the docs, guides, blog, and changelog for LibreChat. It is a [Next.js](https://nextjs.org) application built on [Fumadocs](https://fumadocs.dev), with content authored in MDX.

> Looking for the LibreChat app itself? It lives at **[danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)**. Open code and product issues there, and documentation issues here.

## Table of Contents

- [What's New in LibreChat v0.8.8-rc1](#whats-new-in-librechat-v088-rc1)
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
