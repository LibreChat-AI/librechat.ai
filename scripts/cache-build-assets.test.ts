import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_PROBE_PATHS,
  DeploymentSkewError,
  discoverCurrentBuildAssets,
  discoverCurrentBuildAssetsWithRetry,
  mapConcurrent,
  extractBuildAssetUrls,
  extractDeploymentId,
  extractWebpackRuntimeAssetUrls,
  withCacheProbe,
} from './cache-build-assets.mjs'

const origin = 'https://www.librechat.ai'
const toUrl = (input: string | URL | Request) =>
  new URL(input instanceof Request ? input.url : input)

describe('DEFAULT_PROBE_PATHS', () => {
  it('covers each static and dynamic page template with a live route', () => {
    expect(DEFAULT_PROBE_PATHS).toEqual([
      '/',
      '/about',
      '/authors',
      '/authors/danny',
      '/blog',
      '/blog/2024-04-17_blog_guide',
      '/changelog',
      '/changelog/config_v1.0.0',
      '/cookie',
      '/de',
      '/demo/privacy',
      '/demo/terms',
      '/docs',
      '/de/docs',
      '/privacy',
      '/subscribe',
      '/toolkit',
      '/toolkit/creds-generator',
      '/toolkit/yaml-checker',
      '/tos',
      '/unsubscribe',
    ])
  })
})

describe('extractBuildAssetUrls', () => {
  it('collects and deduplicates same-origin Next.js assets from script and link tags', () => {
    const html = `
      <script src="/_next/static/chunks/webpack-123.js"></script>
      <script src='https://www.librechat.ai/_next/static/chunks/webpack-123.js'></script>
      <link rel="stylesheet" href="/_next/static/css/app.css?x=1&amp;y=2#theme" />
      <link rel="preload" href="https://cdn.example.com/_next/static/foreign.js" />
      <img src="/_next/static/media/ignored.png" />
      <script src="http://[invalid"></script>
      <script src="/ordinary.js"></script>
    `

    expect(extractBuildAssetUrls(html, origin)).toEqual([
      'https://www.librechat.ai/_next/static/chunks/webpack-123.js',
      'https://www.librechat.ai/_next/static/css/app.css?x=1&y=2',
    ])
  })
})

describe('extractDeploymentId', () => {
  it('reads the deployment id Next.js publishes on the html element', () => {
    expect(extractDeploymentId('<html data-dpl-id="dpl_abc" lang="en">')).toBe('dpl_abc')
    expect(extractDeploymentId('<html lang="en">')).toBeNull()
  })
})

describe('withCacheProbe', () => {
  it('preserves an existing query while replacing the probe key', () => {
    const url = withCacheProbe(`${origin}/_next/static/a.js?x=1`, 'run 2')
    expect(url).toBe(`${origin}/_next/static/a.js?x=1&__librechat_cache_probe=run+2`)
  })
})

describe('extractWebpackRuntimeAssetUrls', () => {
  it('collects direct assets and materializes mapped lazy chunks without evaluating code', () => {
    const runtime = `
      r.u=e=>7===e
        ? "static/chunks/special.js"
        : "static/chunks/"+(({12:"named"})[e]||e)+"."+({12:"abc123",34:"def456"})[e]+".js",
      r.miniCssF=e=>9===e
        ? "static/css/special.css"
        : "static/css/"+(({12:"theme"})[e]||e)+"."+({12:"csshash",56:"othercss"})[e]+".css",
      r.g={}
    `

    expect(extractWebpackRuntimeAssetUrls(runtime, origin)).toEqual([
      `${origin}/_next/static/chunks/34.def456.js`,
      `${origin}/_next/static/chunks/named.abc123.js`,
      `${origin}/_next/static/chunks/special.js`,
      `${origin}/_next/static/css/56.othercss.css`,
      `${origin}/_next/static/css/special.css`,
      `${origin}/_next/static/css/theme.csshash.css`,
    ])
  })

  it('fails closed when the runtime format cannot be understood', () => {
    expect(() => extractWebpackRuntimeAssetUrls('not a webpack runtime', origin)).toThrow(
      'Could not find the Webpack lazy-chunk factory',
    )
  })

  it('uses a direct miniCssF map value as the complete filename stem', () => {
    const runtime = `
      r.u=e=>"static/chunks/"+e+"."+({42:"lazyhash"})[e]+".js",
      r.miniCssF=e=>"static/css/"+({12:"contenthash"})[e]+".css",
      r.g={}
    `

    expect(extractWebpackRuntimeAssetUrls(runtime, origin)).toEqual([
      `${origin}/_next/static/chunks/42.lazyhash.js`,
      `${origin}/_next/static/css/contenthash.css`,
    ])
  })
})

describe('discoverCurrentBuildAssets', () => {
  it('collects the union of assets from fresh production page shells', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const { pathname } = toUrl(input)
      if (pathname.endsWith('/webpack-test.js')) {
        return new Response(
          'r.u=e=>"static/chunks/"+e+"."+({42:"lazyhash"})[e]+".js",' +
            'r.miniCssF=e=>"static/css/lazy.css",r.g={}',
        )
      }
      const chunk = pathname === '/' ? 'shared' : 'docs'
      return new Response(
        `<script src="/_next/static/chunks/${chunk}.js"></script>` +
          '<script src="/_next/static/chunks/shared.js"></script>' +
          '<script src="/_next/static/chunks/webpack-test.js"></script>',
      )
    })

    await expect(
      discoverCurrentBuildAssets({
        fetchImpl,
        origin,
        probePaths: ['/', '/docs'],
        token: 'test',
      }),
    ).resolves.toEqual([
      `${origin}/_next/static/chunks/42.lazyhash.js`,
      `${origin}/_next/static/chunks/docs.js`,
      `${origin}/_next/static/chunks/shared.js`,
      `${origin}/_next/static/chunks/webpack-test.js`,
      `${origin}/_next/static/css/lazy.css`,
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('fails when a fresh production page shell cannot be fetched', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 404 }))
    await expect(
      discoverCurrentBuildAssets({ fetchImpl, origin, probePaths: ['/'], token: 'test' }),
    ).rejects.toThrow('Fresh page probe failed')
  })

  it('fails loudly when no build assets can be discovered', async () => {
    const fetchImpl = vi.fn(async () => new Response('<main>No scripts</main>'))
    await expect(
      discoverCurrentBuildAssets({ fetchImpl, origin, probePaths: ['/'], token: 'test' }),
    ).rejects.toThrow('No Next.js build assets')
  })

  /**
   * A Turbopack build serves `/_next/static/immutable/**` and ships no Webpack
   * runtime, so there is no lazy-chunk map. Discovery must return the eager
   * shell assets rather than failing, and must not invent a runtime request.
   */
  it('accepts a Turbopack build with no Webpack runtime', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          '<html data-dpl-id="dpl_test">' +
            '<link href="/_next/static/immutable/chunks/style.css" rel="stylesheet">' +
            '<script src="/_next/static/immutable/chunks/page.js"></script>' +
            '</html>',
        ),
    )

    await expect(
      discoverCurrentBuildAssets({ fetchImpl, origin, probePaths: ['/'], token: 'test' }),
    ).resolves.toEqual([
      `${origin}/_next/static/immutable/chunks/page.js`,
      `${origin}/_next/static/immutable/chunks/style.css`,
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})

describe('discoverCurrentBuildAssetsWithRetry', () => {
  const runtimeSource =
    'r.u=e=>"static/chunks/"+e+"."+({42:"lazyhash"})[e]+".js",' +
    'r.miniCssF=e=>"static/css/lazy.css",r.g={}'

  it('retries through an alias transition instead of aborting the purge', async () => {
    let runtimeRequests = 0
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const { pathname } = toUrl(input)
      if (pathname.startsWith('/_next/')) {
        runtimeRequests += 1
        return runtimeRequests === 1
          ? new Response(null, { status: 404 })
          : new Response(runtimeSource)
      }
      return new Response('<script src="/_next/static/chunks/webpack-new.js"></script>')
    })
    const sleepImpl = vi.fn(async () => {})
    const onRetry = vi.fn()

    await expect(
      discoverCurrentBuildAssetsWithRetry({
        fetchImpl,
        origin,
        probePaths: ['/'],
        token: 'test',
        backoffMs: 1,
        sleepImpl,
        onRetry,
      }),
    ).resolves.toEqual([
      `${origin}/_next/static/chunks/42.lazyhash.js`,
      `${origin}/_next/static/chunks/webpack-new.js`,
      `${origin}/_next/static/css/lazy.css`,
    ])
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(sleepImpl).toHaveBeenCalledWith(1)
  })

  it('drains a failed probe batch before returning its error', async () => {
    const slowProbe = Promise.withResolvers<void>()
    const allWorkersStarted = Promise.withResolvers<void>()
    let started = 0
    let batchSettled = false

    const batch = mapConcurrent(['fast failure', 'slow probe'], async (item) => {
      started += 1
      if (started === 2) allWorkersStarted.resolve()
      if (item === 'fast failure') throw new Error('probe failed')
      await slowProbe.promise
      return item
    })
    void batch.then(
      () => {
        batchSettled = true
      },
      () => {
        batchSettled = true
      },
    )

    await allWorkersStarted.promise
    await Promise.resolve()
    expect(batchSettled).toBe(false)

    slowProbe.resolve()
    await expect(batch).rejects.toThrow('probe failed')
    expect(batchSettled).toBe(true)
  })

  it('treats shells from different builds as a transition, and gives up', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const { pathname } = toUrl(input)
      if (pathname.startsWith('/_next/')) return new Response(runtimeSource)
      const build = pathname === '/' ? 'old' : 'new'
      return new Response(`<script src="/_next/static/chunks/webpack-${build}.js"></script>`)
    })

    const error = await discoverCurrentBuildAssetsWithRetry({
      fetchImpl,
      origin,
      probePaths: ['/', '/docs'],
      token: 'test',
      attempts: 2,
      backoffMs: 1,
      sleepImpl: async () => {},
    }).catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(DeploymentSkewError)
    expect((error as Error).message).toContain('came from more than one build')
  })

  /**
   * Turbopack builds carry no Webpack runtime, so the deployment id published
   * by Skew Protection is the only shell identity available mid-transition.
   */
  it('detects a transition from disagreeing deployment ids', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const { pathname } = toUrl(input)
      const id = pathname === '/' ? 'dpl_old' : 'dpl_new'
      return new Response(
        `<html data-dpl-id="${id}"><script src="/_next/static/immutable/chunks/a.js"></script></html>`,
      )
    })

    const error = await discoverCurrentBuildAssetsWithRetry({
      fetchImpl,
      origin,
      probePaths: ['/', '/docs'],
      token: 'test',
      attempts: 2,
      backoffMs: 1,
      sleepImpl: async () => {},
    }).catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(DeploymentSkewError)
    expect((error as Error).message).toContain('dpl_old vs dpl_new')
  })

  it('rejects immutable shells without a deployment identity', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('<script src="/_next/static/immutable/chunks/page.js"></script>'),
    )

    const error = await discoverCurrentBuildAssetsWithRetry({
      fetchImpl,
      origin,
      probePaths: ['/'],
      token: 'test',
      attempts: 2,
      backoffMs: 1,
      sleepImpl: async () => {},
    }).catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(DeploymentSkewError)
    expect((error as Error).message).toContain('no deployment identity')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('does not retry a permanent page-probe response', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 401 }))
    const sleepImpl = vi.fn(async () => {})

    await expect(
      discoverCurrentBuildAssetsWithRetry({
        fetchImpl,
        origin,
        probePaths: ['/'],
        token: 'test',
        sleepImpl,
      }),
    ).rejects.toThrow('HTTP 401')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(sleepImpl).not.toHaveBeenCalled()
  })

  it('does not retry a permanent runtime-probe response', async () => {
    let runtimeRequests = 0
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      if (toUrl(input).pathname.startsWith('/_next/')) {
        runtimeRequests += 1
        return new Response(null, { status: 403 })
      }
      return new Response('<script src="/_next/static/chunks/webpack-test.js"></script>')
    })
    const sleepImpl = vi.fn(async () => {})

    await expect(
      discoverCurrentBuildAssetsWithRetry({
        fetchImpl,
        origin,
        probePaths: ['/'],
        token: 'test',
        sleepImpl,
      }),
    ).rejects.toThrow('HTTP 403')
    expect(runtimeRequests).toBe(1)
    expect(sleepImpl).not.toHaveBeenCalled()
  })

  it('does not retry a failure a later attempt cannot fix', async () => {
    const fetchImpl = vi.fn(async () => new Response('<main>No scripts</main>'))
    const sleepImpl = vi.fn(async () => {})

    await expect(
      discoverCurrentBuildAssetsWithRetry({
        fetchImpl,
        origin,
        probePaths: ['/'],
        token: 'test',
        sleepImpl,
      }),
    ).rejects.toThrow('No Next.js build assets')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(sleepImpl).not.toHaveBeenCalled()
  })
})
