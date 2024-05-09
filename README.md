# LibreChat Docs

Based on [Nextra](https://nextra.site/)

## Local Development

Pre-requisites: Node.js 18+, pnpm 9+

1. Optional: Create env based on [.env.template](./.env.template)
2. Run `pnpm i` to install the dependencies.
3. Run `pnpm dev` to start the development server on localhost:3333
4. Run `pnpm build` to build...
5. Run `pnpm start` to start the production server on localhost:3333

⚠️ **Note: try building prod before making a PR**

## Bundle analysis

Run `pnpm run analyze` to analyze the bundle size of the production build using `@next/bundle-analyzer`.
