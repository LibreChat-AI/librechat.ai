# LibreChat Docs

The official documentation site for [LibreChat](https://github.com/danny-avila/LibreChat), built with [Next.js 15](https://nextjs.org/) and [Fumadocs](https://fumadocs.vercel.app/).

**[www.librechat.ai](https://www.librechat.ai)**

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Docs Engine:** Fumadocs (fumadocs-mdx + fumadocs-ui)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Package Manager:** Bun

## Local Development

**Prerequisites:** [Bun](https://bun.sh/) 1.0+

1. Clone the repository
2. Copy `.env.template` to `.env.local` and fill in any optional values
3. Install dependencies:
   ```bash
   bun i
   ```
4. Start the dev server (uses Turbopack):
   ```bash
   bun dev
   ```
5. Open [http://localhost:3333](http://localhost:3333)

**Note:** Always run `bun run build` before opening a PR to catch build errors early.

## Project Structure

```
app/              # Next.js App Router pages (docs, blog, changelog, API routes)
content/
  docs/           # Documentation pages (MDX)
  blog/           # Blog posts (MDX)
  changelog/      # Changelog entries (MDX)
components/       # React components (home, UI, icons, etc.)
lib/              # Utilities, icons, MDX components, Nextra shims
public/           # Static assets
pages/            # Legacy pages (migrating to app/)
source.config.ts  # Fumadocs content collections config
```

### Documentation Content

Docs live in `content/docs/` and are organized by section. Each directory has a `meta.json` that controls sidebar navigation:

```json
{
  "title": "Section Title",
  "icon": "Wrench",
  "pages": ["index", "page-one", "page-two"]
}
```

Only pages listed in the `pages` array appear in the sidebar.

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server on port 3333 (Turbopack) |
| `bun run build` | Production build |
| `bun start` | Start production server on port 3333 |
| `bun run lint` | Run ESLint |
| `bun run prettier` | Format code with Prettier |
| `bun run analyze` | Analyze production bundle size |

## License

[MIT](./LICENSE)
