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

This repository powers **[www.librechat.ai](https://www.librechat.ai)**: the docs, guides, blog, and changelog for LibreChat. It is a [Next.js](https://nextjs.org) application built on [Fumadocs](https://fumadocs.dev), with content authored in MDX.

> Looking for the LibreChat app itself? It lives at **[danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)**. Open code and product issues there, and documentation issues here.

## Table of Contents

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

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Start the dev server on port 3333             |
| `pnpm build`           | Production build                              |
| `pnpm start`           | Start the production server on port 3333      |
| `pnpm lint`            | Run ESLint (zero warnings allowed)            |
| `pnpm lint:prettier`   | Check formatting with Prettier                |
| `pnpm prettier`        | Format the codebase with Prettier             |
| `pnpm typecheck`       | Generate MDX types and run `tsc --noEmit`     |
| `pnpm test`            | Run the Vitest suite                          |
| `pnpm test:watch`      | Run Vitest in watch mode                      |
| `pnpm analyze`         | Build and analyze the production bundle size  |
| `pnpm optimize:images` | Optimize images in `public/`                  |
| `pnpm translate`       | Generate translations from the English source |

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
