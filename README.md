# LibreChat Docs

The official documentation site for [LibreChat](https://github.com/danny-avila/LibreChat), built with [Next.js 15](https://nextjs.org/) and [Fumadocs](https://fumadocs.vercel.app/).

**[www.librechat.ai](https://www.librechat.ai)**

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Docs Engine:** Fumadocs (fumadocs-mdx + fumadocs-ui)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Local Development

**Prerequisites:** Node.js 20.19+ and [pnpm](https://pnpm.io/) 9.5.0+

1. Clone the repository
2. Copy `.env.template` to `.env.local` and fill in any optional values
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start the dev server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:3333](http://localhost:3333)

**Note:** Always run `pnpm build` before opening a PR to catch build errors early.

## Project Structure

```
app/              # Next.js App Router pages (docs, blog, changelog, API routes)
content/
  docs/           # Documentation pages (MDX)
  blog/           # Blog posts (MDX)
  changelog/      # Changelog entries (MDX)
components/       # React components (home, UI, icons, etc.)
lib/              # Utilities, icons, MDX components, content sources
public/           # Static assets
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

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `pnpm dev`      | Start dev server on port 3333        |
| `pnpm build`    | Production build                     |
| `pnpm start`    | Start production server on port 3333 |
| `pnpm lint`     | Run ESLint                           |
| `pnpm prettier` | Format code with Prettier            |
| `pnpm analyze`  | Analyze production bundle size       |

## License

[MIT](./LICENSE)
