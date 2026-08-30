const { lastmodFor } = require('./lib/lastmod.cjs')

/**
 * Routes that next-sitemap discovers but that must never be submitted for
 * indexing. It builds the URL set from Next's prerender manifest, which lists
 * every statically rendered App Router entry — including route handlers. Left
 * alone, the sitemap advertises ~190 non-HTML endpoints (the raw-Markdown
 * mirror of every docs page, the LLM indexes, the agent-discovery documents)
 * plus the redirect-only /toolkit aliases, none of which is a page a reader can
 * land on.
 *
 * Anything listed here that a crawler can still reach on its own also carries
 * `X-Robots-Tag: noindex` from next.config.mjs; keeping it out of the sitemap
 * is the half that stops us actively asking for it to be indexed.
 */
const NON_PAGE_ROUTES = [
  // Navigation metadata, not a page.
  '*/_meta',
  // Redirect-only aliases; every one 308s into /docs/toolkit.
  '/toolkit*',
  // Raw Markdown served for LLM and agent tooling.
  '/llms.txt',
  '/llms-full.txt',
  '/llms.mdx*',
  '/docs/*.md',
  '/docs/*.mdx',
  // Machine-readable service descriptions and agent discovery.
  '/auth.md',
  '/openapi.json',
  '/mcp',
  '/.well-known/*',
  '/api/*',
]

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.librechat.ai',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    // Content-Signal (https://contentsignals.org) states what crawlers may do
    // with the pages they fetch. The docs are open-source content and the Terms
    // (app/tos/page.tsx) already welcome well-behaved AI-training crawlers, so
    // every signal is opt-in: train on it, index it, ground answers in it.
    transformRobotsTxt: async (_, robotsTxt) =>
      robotsTxt.replace(
        'User-agent: *',
        'User-agent: *\nContent-Signal: ai-train=yes, search=yes, ai-input=yes',
      ),
  },
  exclude: NON_PAGE_ROUTES,
  /**
   * One `<loc>`, plus a `<lastmod>` only where a real date exists.
   *
   * `<changefreq>` and `<priority>` are deliberately absent. Google has said
   * for years that it ignores both, and the values we were emitting were not
   * even meaningfully differentiated — every one of the 2,340 translated docs
   * pages claimed priority 0.9 and weekly changes. An omitted hint costs
   * nothing; a hint that is uniform across the whole site conveys nothing.
   *
   * See lib/lastmod.cjs for where the dates come from and why a route with no
   * honest date gets no `<lastmod>` rather than a synthesized one.
   */
  transform: async (_config, path) => ({
    loc: path,
    lastmod: lastmodFor(path),
  }),
}
