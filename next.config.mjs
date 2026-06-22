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
  ['/toolkit/yaml_checker', '/toolkit/yaml-checker'],
  ['/toolkit/creds_generator', '/toolkit/creds-generator'],
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
 */
const SHARED_CDN_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800'
const cdnCacheHeaders = [
  '/docs/:path*',
  // Localized docs (/<locale>/docs/...). Without this they match no cache rule,
  // so Cloudflare never edge-caches them and every language switch is a full
  // origin round-trip — including the 307 that untranslated pages redirect with.
  '/(zh|es|fr|de|ja)/docs/:path*',
  '/(blog|changelog|authors|privacy|tos|cookie)(.*)',
].flatMap((source) => [
  {
    source,
    missing: [{ type: 'header', key: 'RSC' }],
    headers: [{ key: 'Cache-Control', value: SHARED_CDN_CACHE }],
  },
  {
    source,
    has: [{ type: 'header', key: 'RSC' }],
    headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
  },
])

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
    /**
     * MDX loader for components/ directory files.
     * These are MDX files imported directly as React components
     * (e.g. changelog content, repeated sections). The content/ MDX is handled
     * by createMDX (withMDX), so only the components/ rule lives here.
     */
    webpackConfig.module.rules.push({
      test: /\.mdx?$/,
      include: [resolve(process.cwd(), 'components')],
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
