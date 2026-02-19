import { start } from 'fumadocs-mdx/next';
import NextBundleAnalyzer from '@next/bundle-analyzer';
import { resolve } from 'path';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Start the Fumadocs MDX server which generates .source/ files
 * from content/ directory. This runs separately from the webpack loader.
 */
if (process.env._FUMADOCS_MDX !== '1') {
  process.env._FUMADOCS_MDX = '1';
  void start(process.env.NODE_ENV === 'development', 'source.config.ts', '.source');
}

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
`;

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
  ['/docs/configuration/librechat_yaml/ai_endpoints/azure', '/docs/configuration/azure'],
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
];

/**
 * Nextra compatibility shims - redirect nextra imports to local stubs
 * so the existing pages/ directory can build during the Fumadocs migration.
 * These will be removed once all pages/ content is migrated to app/.
 */
const nextraShims = resolve(process.cwd(), 'lib/nextra-shims');

/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  webpack(webpackConfig, options) {
    // Nextra compatibility: redirect nextra imports to local shims
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      'nextra/context': resolve(nextraShims, 'context.tsx'),
      'nextra/components': resolve(nextraShims, 'components.tsx'),
      nextra: resolve(nextraShims, 'index.ts'),
      'nextra-theme-docs': resolve(nextraShims, 'theme-docs.tsx'),
    };

    /**
     * Fumadocs MDX loader: only applied to content/ directory files.
     * These are processed by fumadocs-mdx for the app/ router docs.
     */
    webpackConfig.module.rules.push({
      test: /\.mdx?$/,
      include: [resolve(process.cwd(), 'content')],
      use: [
        options.defaultLoaders.babel,
        {
          loader: 'fumadocs-mdx/loader-mdx',
          options: {
            configPath: 'source.config.ts',
            outDir: '.source',
          },
        },
      ],
    });

    /**
     * Basic MDX loader for pages/ directory and components/ directory files.
     * Provides minimal MDX compilation so existing pages/ content
     * can compile during the migration period.
     * Uses a custom providerImportSource that provides the same
     * components Nextra used to auto-inject (Callout, Steps, etc.).
     */
    webpackConfig.module.rules.push({
      test: /\.mdx?$/,
      include: [resolve(process.cwd(), 'pages'), resolve(process.cwd(), 'components')],
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            providerImportSource: resolve(process.cwd(), 'lib/nextra-shims/mdx-components.tsx'),
          },
        },
      ],
    });

    /**
     * Replace Nextra _meta files with a dummy React component export
     * so Next.js doesn't fail when encountering them as pages.
     */
    webpackConfig.module.rules.push({
      test: /pages[\\/].*_meta\.(ts|js|tsx|jsx)$/,
      use: {
        loader: resolve(process.cwd(), 'lib/nextra-shims/meta-loader.cjs'),
      },
    });

    return webpackConfig;
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
    ];
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
  redirects: async () => [
    ...nonPermanentRedirects.map(([source, destination]) => ({
      source,
      destination,
      permanent: false,
    })),
  ],
};

export default withBundleAnalyzer(config);
