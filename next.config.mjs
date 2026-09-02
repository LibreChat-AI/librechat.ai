import { createMDX } from 'fumadocs-mdx/next'
import NextBundleAnalyzer from '@next/bundle-analyzer'
import { resolve } from 'path'
import { computeOgVersion } from './lib/og-version.mjs'

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * Fumadocs MDX (v15) integration. `createMDX` wires the content/ MDX loaders
 * (webpack + turbopack) and generates the `.source/` files from source.config.ts;
 * it replaces the removed `start()` API and the manual content/ webpack rule.
 */
const withMDX = createMDX({ configPath: 'source.config.ts' })

/**
 * CSP headers
 * img-src https to allow loading images from SSO providers
 * 'unsafe-inline' is required for inline styles and Next.js script injection
 */
const cspHeader = `
  default-src 'self' https: wss:;
  script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''} https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' https: blob: data:;
  media-src 'self' https: blob: data:;
  font-src 'self' https:;
  frame-src 'self' https:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  block-all-mixed-content;
`

const nonPermanentRedirects = [
  ['/discord', 'https://discord.librechat.ai'],
  ['/demo', 'https://chat.librechat.ai'],
  ['/issue', 'https://github.com/danny-avila/LibreChat/issues/new/choose'],
  ['/new-issue', 'https://github.com/danny-avila/LibreChat/issues/new/choose'],
  ['/issues', 'https://github.com/danny-avila/LibreChat/issues'],
  ['/gh-support', 'https://github.com/danny-avila/LibreChat/discussions/categories/support'],
  ['/gh-discussions', 'https://github.com/danny-avila/LibreChat/discussions'],
  ['/roadmap', '/blog/2026-02-18_2026_roadmap'],
  ['/features', '/docs/features'],
  ['/docs/configuration/azure', '/docs/configuration/librechat_yaml/ai_endpoints/azure'],
  ['/docs/user_guides/artifacts', '/docs/features/artifacts'],
  ['/docs/user_guides/fork', '/docs/features/fork'],
  ['/docs/user_guides/authentication', '/docs/features/authentication'],
  ['/docs/user_guides/mod_system', '/docs/features/mod_system'],
  ['/docs/user_guides/search', '/docs/features/search'],
  ['/docs/user_guides/import_convos', '/docs/features/import_convos'],
  ['/docs/user_guides/password_reset', '/docs/features/password_reset'],
  ['/docs/user_guides/rag_api', '/docs/features/rag_api'],
  ['/docs/user_guides/plugins', '/docs/features/agents'],
  ['/docs/features/plugins', '/docs/features/agents'],
  ['/docs/features/speech-to-text', '/docs/configuration/stt_tts'],
  ['/docs/configuration/librechat_yaml/setup', '/docs/configuration/librechat_yaml'],
  // The toolkit pages live under /docs/toolkit; these are the pre-Fumadocs URLs
  // still linked from older posts and bookmarks. In-page links are canonicalized
  // at render time by lib/localize-href.ts, but a direct hit only has these, so
  // both spellings of each slug have to land on the real page rather than on the
  // other spelling.
  ['/toolkit', '/docs/toolkit'],
  ['/toolkit/yaml_checker', '/docs/toolkit/yaml-validator'],
  ['/toolkit/yaml-checker', '/docs/toolkit/yaml-validator'],
  ['/toolkit/creds_generator', '/docs/toolkit/credentials-generator'],
  ['/toolkit/creds-generator', '/docs/toolkit/credentials-generator'],
  // Nav-only folder: the section's landing page is the Config Structure reference.
  [
    '/docs/configuration/librechat_yaml/object_structure',
    '/docs/configuration/librechat_yaml/object_structure/config',
  ],
]

/**
 * Build-time content fingerprint of the Open Graph cards. Inlined into the
 * bundle so lib/og.ts can append it as `?v=` to every social-card URL without
 * any runtime filesystem reads. A card change yields a new hash -> a new URL
 * -> a cache-miss at every layer (Cloudflare edge + scraper image proxies),
 * which is what makes updated cards show up without a manual purge/re-scrape.
 */
const OG_VERSION = computeOgVersion()

/**
 * Edge-cache headers for the App Router routes whose HTML we want a shared CDN
 * (Cloudflare, in front of the origin) to cache.
 *
 * The App Router serves two responses at every page URL: the HTML document and
 * the RSC flight payload (`text/x-component`), told apart only by the `RSC`
 * request header that Next advertises via `Vary: RSC`. Cloudflare ignores
 * `Vary: RSC`, so a single `public, s-maxage` rule on the URL lets it cache
 * whichever variant it happens to see first and serve that to everyone. When a
 * Next prefetch populates the entry with the flight payload, real browser
 * navigations then receive raw `text/x-component` data and render it as garbage
 * (`:HL[...] 0:{"buildId"...}`) instead of the page.
 *
 * Split the rule on the `RSC` header: the document response (no header) stays
 * shared-cacheable, the flight payload (header present) is marked
 * `private, no-store` so the CDN never caches it and therefore can never serve
 * one as a document. A cached document occasionally returned to an RSC request
 * just makes Next fall back to a full navigation, which is harmless.
 *
 * The same collision applies to the markdown content negotiation in proxy.ts
 * (`isMarkdownPreferred`): a `/docs/*` request with `Accept: text/markdown`
 * (LLM/agent tooling) gets rewritten to the raw-markdown response, but that
 * response shares its cache key with the HTML document since Cloudflare
 * ignores `Vary` here too. Whichever one a given edge PoP sees first for a URL
 * gets cached for it and served to everyone else hitting that PoP, including
 * browsers, until the entry expires. Mark those responses `private, no-store`
 * for the same reason as the RSC flight payload.
 */
const SHARED_CDN_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800'

/**
 * Pages that render live data need an edge TTL matching the ISR window of the
 * route that builds them (`revalidate` in app/blog/[slug]/page.tsx). Under the
 * shared blog rule the CDN would keep serving a day-old document, so a post
 * showing "live" numbers would be up to 24h stale no matter how often the origin
 * regenerated it. Keep the two windows in step when changing either.
 */
const LIVE_DATA_CDN_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'
const LIVE_DATA_PATHS = ['/blog/2026-07-26_clickhouse-analytics']

const AGENT_DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1"',
  '</docs>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
].join(', ')

/**
 * Cache rules for one source: the document response stays shared-cacheable at
 * the given TTL, while the two variants that share its cache key — the RSC
 * flight payload and the markdown negotiation — are marked uncacheable, for the
 * reasons in the note above.
 */
const cdnRulesFor = (source, cache) => [
  {
    source,
    missing: [{ type: 'header', key: 'RSC' }],
    headers: [{ key: 'Cache-Control', value: cache }],
  },
  {
    source,
    has: [{ type: 'header', key: 'RSC' }],
    headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
  },
  {
    source,
    has: [{ type: 'header', key: 'accept', value: '.*text/markdown.*' }],
    headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
  },
]

const MARKDOWN_NEGOTIATED_PATHS = [
  '/docs/:path*',
  // Localized docs need the same cache partitioning and edge-cache policy as English.
  '/(zh|es|fr|de|ja|pt-BR|it|nl|pl|vi|ko|id|tr)/docs/:path*',
]

// Middleware response headers are replaced when the App Router emits its RSC
// Vary value. Configure Accept at the route layer so Next appends its own
// variants instead of dropping the content-negotiation cache key.
const markdownNegotiatedVaryHeaders = MARKDOWN_NEGOTIATED_PATHS.map((source) => ({
  source,
  headers: [{ key: 'Vary', value: 'Accept' }],
}))

// The narrower live-data rules come last so their Cache-Control overrides the
// shared value on the paths they match.
const cdnCacheHeaders = [
  ...[
    '/docs/:path*',
    // Localized docs (/<locale>/docs/...). Without this they match no cache rule,
    // so Cloudflare never edge-caches them and every language switch is a full
    // origin round-trip — including the 307 that untranslated pages redirect with.
    '/(zh|es|fr|de|ja|pt-BR|it|nl|pl|vi|ko|id|tr)/docs/:path*',
    '/(blog|changelog|authors|privacy|tos|cookie)(.*)',
  ].flatMap((source) => cdnRulesFor(source, SHARED_CDN_CACHE)),
  ...LIVE_DATA_PATHS.flatMap((source) => cdnRulesFor(source, LIVE_DATA_CDN_CACHE)),
]

/** @type {import('next').NextConfig} */
const config = {
  poweredByHeader: false,
  env: {
    OG_VERSION,
  },
  // The OG renderer (app/api/og/route.tsx) reads the logo + fonts from disk at
  // runtime via process.cwd(). Those paths aren't statically analyzable, so
  // Next's tracing can miss them and the function 404s/500s on Vercel. Force
  // them into the serverless bundle for that route.
  outputFileTracingIncludes: {
    '/api/og': [
      './lib/fonts/Geist-Regular.ttf',
      './lib/fonts/Geist-SemiBold.ttf',
      './public/librechat.png',
    ],
    '/mcp': ['./content/docs/**/*.mdx'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Tree-shake large barrel-file packages so only the icons/animations actually
  // used are bundled, instead of the entire module.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  turbopack: {},
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  webpack(webpackConfig, options) {
    const componentsDir = resolve(process.cwd(), 'components')

    /**
     * createMDX (withMDX) already pushed a global `.mdx` rule using
     * `fumadocs-mdx/webpack/mdx`. Scope it away from components/ so it doesn't
     * double-process the component MDX that the @mdx-js/loader rule below owns
     * (chaining the two loaders fails with "only import/exports are supported").
     */
    for (const rule of webpackConfig.module.rules) {
      const usesFumadocsMdx =
        Array.isArray(rule?.use) &&
        rule.use.some(
          (u) => typeof u === 'object' && u?.loader?.includes('fumadocs-mdx/webpack/mdx'),
        )
      if (usesFumadocsMdx) {
        const existing = Array.isArray(rule.exclude)
          ? rule.exclude
          : rule.exclude
            ? [rule.exclude]
            : []
        rule.exclude = [...existing, componentsDir]
      }
    }

    /**
     * MDX loader for components/ directory files.
     * These are MDX files imported directly as React components
     * (e.g. changelog content, repeated sections). The content/ MDX is handled
     * by createMDX (withMDX), so only the components/ rule lives here.
     */
    webpackConfig.module.rules.push({
      test: /\.mdx?$/,
      include: [componentsDir],
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            providerImportSource: resolve(process.cwd(), 'lib/mdx-provider.ts'),
          },
        },
      ],
    })

    return webpackConfig
  },
  transpilePackages: ['react-tweet', 'geist'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.librechat.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/{user-attachments,danny-avila}/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.librechat.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'librechat.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-frame-options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'autoplay=(self), fullscreen=(self), microphone=()',
          },
        ],
      },
      {
        source: '/:path((?!api).*)*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replaceAll('\n', ''),
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: AGENT_DISCOVERY_LINKS,
          },
        ],
      },
      ...markdownNegotiatedVaryHeaders,
      ...cdnCacheHeaders,
    ]
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*',
      },
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ]
  },
  redirects: async () => [
    ...nonPermanentRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    })),
  ],
}

export default withBundleAnalyzer(withMDX(config))
