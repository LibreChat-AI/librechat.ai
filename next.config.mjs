/* eslint-disable no-undef */

import remarkGfm from 'remark-gfm'
import nextra from 'nextra'
import NextBundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * CSP headers
 * img-src https to allow loading images from SSO providers
 */
const cspHeader = `
  default-src 'self' https: wss:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;
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
  // Up to date Redirects:
  ['/discord', 'https://discord.librechat.ai'],
  ['/demo', 'https://chat.librechat.ai'],
  ['/issue', 'https://github.com/danny-avila/LibreChat/issues/new/choose'],
  ['/new-issue', 'https://github.com/danny-avila/LibreChat/issues/new/choose'],
  ['/issues', 'https://github.com/danny-avila/LibreChat/issues'],
  ['/gh-support', 'https://github.com/danny-avila/LibreChat/discussions/categories/support'],
  ['/gh-discussions', 'https://github.com/danny-avila/LibreChat/discussions'],
  ['/roadmap', '/docs/roadmap'],
  ['/features', '/docs/features'],
  /* Danny moved these :P */
  ['/docs/configuration/librechat_yaml/ai_endpoints/azure', '/docs/configuration/azure'],
  ['/docs/user_guides/artifacts', '/docs/features/artifacts'],
  ['/docs/user_guides/fork', '/docs/features/fork'],
  ['/docs/user_guides/authentication', '/docs/features/authentication'],
  ['/docs/user_guides/mod_system', '/docs/features/mod_system'],
  ['/docs/user_guides/search', '/docs/features/search'],
  ['/docs/user_guides/import_convos', '/docs/features/import_convos'],
  ['/docs/user_guides/password_reset', '/docs/features/password_reset'],
  ['/docs/user_guides/rag_api', '/docs/features/rag_api'],
  ['/docs/user_guides/plugins', '/docs/features/plugins'],
  // Redirect to overview pages
  ...[].map((path) => [path, path + '/overview']),
]

const permanentRedirects = []

// nextra config
const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
  latex: {
    renderer: 'mathjax',
  },
  defaultShowCopyCode: true,
})

// next config
const nextraConfig = withNextra({
  experimental: {
    esmExternals: 'loose',
    scrollRestoration: true,
  },
  serverExternalPackages: ['mongoose'],
  transpilePackages: ['react-tweet', 'react-syntax-highlighter', 'geist'],
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
        pathname: '/**',
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
            value: 'SAMEORIGIN',
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
            value: 'autoplay=*, fullscreen=*, microphone=*',
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
    ]
  },
  redirects: async () => [
    ...nonPermanentRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    })),
    ...permanentRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    })),
  ],
})

export default withBundleAnalyzer(nextraConfig)
