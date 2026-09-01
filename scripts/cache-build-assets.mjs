/**
 * Discovers build assets referenced by the current production page shells and
 * their Webpack runtime.
 *
 * A Vercel alias transition can briefly return a 404 for a new immutable
 * `/_next/static/**` URL. Cloudflare's cache rule may retain that 404 in one
 * edge location even after Vercel serves the asset normally. The purge workflow
 * uses this script after the deployment settles and globally purges the exact
 * current URLs, without evicting the entire static-asset namespace.
 */

import { fileURLToPath } from 'node:url'

export const PRODUCTION_ORIGIN = 'https://www.librechat.ai'

// One live page per App Router page template. The stable author, blog, and
// changelog entries exercise their dynamic templates without probing every
// generated page.
export const DEFAULT_PROBE_PATHS = [
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
]

const CACHE_PROBE_PARAM = '__librechat_cache_probe'
const STATIC_PREFIX = '/_next/static/'
const WEBPACK_RUNTIME_PATH = /\/static\/chunks\/webpack-[^/]+\.js$/u
const REQUEST_TIMEOUT_MS = 15_000
const MAX_CONCURRENCY = 8

// A Vercel alias transition is directly observable: an asset that exists a
// moment later answers 404 now, and shells fetched mid-flip disagree about
// which build they came from. Both conditions are retryable. Anything else, an
// unparseable runtime or a shell carrying no assets at all, is a real failure
// and must not be retried into a timeout.
const DISCOVERY_ATTEMPTS = 5
const DISCOVERY_BACKOFF_MS = 10_000

/** A retryable symptom of the production alias still moving. */
export class DeploymentSkewError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DeploymentSkewError'
  }
}

function isWebpackRuntime(asset) {
  return WEBPACK_RUNTIME_PATH.test(new URL(asset).pathname)
}

function decodeAttribute(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&#38;', '&').replaceAll('&#x26;', '&')
}

/** Extract same-origin Next.js build assets from script and link tags. */
export function extractBuildAssetUrls(html, origin = PRODUCTION_ORIGIN) {
  const site = new URL(origin)
  const urls = new Set()
  const tags = html.matchAll(
    /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>/giu,
  )

  for (const match of tags) {
    const value = decodeAttribute(match[1] ?? match[2])
    let url
    try {
      url = new URL(value, site)
    } catch {
      continue
    }
    if (url.origin !== site.origin || !url.pathname.startsWith(STATIC_PREFIX)) continue
    url.hash = ''
    urls.add(url.href)
  }

  return [...urls].sort()
}

function runtimeAssetUrl(value, origin) {
  const url = new URL(value, new URL('/_next/', origin))
  if (url.origin !== new URL(origin).origin || !url.pathname.startsWith(STATIC_PREFIX)) return null
  if (url.pathname.endsWith('/')) return null
  url.hash = ''
  return url.href
}

function parseNumericStringMap(source) {
  const entries = [...source.matchAll(/"?(\d+)"?\s*:\s*"([A-Za-z0-9_-]+)"/gu)].map((match) => [
    match[1],
    match[2],
  ])
  return new Map(entries)
}

function materializeMappedAssets(factory, parameter, directory, extension, origin) {
  const maps = [...factory.matchAll(/\{((?:\s*"?\d+"?\s*:\s*"[A-Za-z0-9_-]+"\s*,?\s*)+)\}/gu)].map(
    (match) => parseNumericStringMap(match[1]),
  )
  if (maps.length === 0) return []

  if (maps.length === 1) {
    const escapedParameter = parameter.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&')
    const prependsChunkId = new RegExp(
      `\\+\\s*${escapedParameter}\\s*\\+\\s*["']\\.["']\\s*\\+`,
      'u',
    ).test(factory)
    return [...maps[0]].flatMap(([id, value]) => {
      // Some factories use `id + "." + hash`; others map the id directly to
      // the complete filename stem. Follow the expression the browser uses.
      const stem = prependsChunkId ? `${id}.${value}` : value
      const url = runtimeAssetUrl(`${directory}/${stem}.${extension}`, origin)
      return url ? [url] : []
    })
  }

  // The hash map is the largest map and appears last on a tie. Earlier maps
  // optionally replace a numeric chunk id with a content-derived basename.
  let hashMapIndex = 0
  for (let index = 1; index < maps.length; index += 1) {
    if (maps[index].size >= maps[hashMapIndex].size) hashMapIndex = index
  }
  const hashMap = maps[hashMapIndex]
  const basenameMaps = maps.slice(0, hashMapIndex)

  const urls = []
  for (const [id, hash] of hashMap) {
    let basename = id
    for (const map of basenameMaps) basename = map.get(id) ?? basename
    const url = runtimeAssetUrl(`${directory}/${basename}.${hash}.${extension}`, origin)
    if (url) urls.push(url)
  }
  return urls
}

/**
 * Extract lazy JS/CSS assets from Next.js' Webpack runtime without executing
 * remote code. Direct filenames are string literals; ordinary lazy JS chunks
 * are represented by numeric-id -> filename/hash maps inside `webpackRequire.u`.
 */
export function extractWebpackRuntimeAssetUrls(source, origin = PRODUCTION_ORIGIN) {
  const urls = new Set()

  for (const match of source.matchAll(/["'](static\/(?:chunks|css|media)\/[^"'\\\s]*)["']/gu)) {
    const url = runtimeAssetUrl(match[1], origin)
    if (url) urls.add(url)
  }

  const chunkFactory = source.match(
    /\.u=([A-Za-z_$][\w$]*)=>([\s\S]*?),\s*[A-Za-z_$][\w$]*\.miniCssF=/u,
  )
  if (!chunkFactory) {
    throw new Error('Could not find the Webpack lazy-chunk factory in the production runtime')
  }

  for (const url of materializeMappedAssets(
    chunkFactory[2],
    chunkFactory[1],
    'static/chunks',
    'js',
    origin,
  )) {
    urls.add(url)
  }

  const cssFactory = source.match(
    /\.miniCssF=([A-Za-z_$][\w$]*)=>([\s\S]*?),\s*[A-Za-z_$][\w$]*\.g=/u,
  )
  if (!cssFactory) {
    throw new Error('Could not find the Webpack lazy-CSS factory in the production runtime')
  }
  for (const url of materializeMappedAssets(
    cssFactory[2],
    cssFactory[1],
    'static/css',
    'css',
    origin,
  )) {
    urls.add(url)
  }

  if (urls.size === 0) {
    throw new Error('No lazy build assets were found in the production Webpack runtime')
  }
  return [...urls].sort()
}

/** Add a unique query key without disturbing any existing query parameters. */
export function withCacheProbe(url, token) {
  const probed = new URL(url)
  probed.searchParams.set(CACHE_PROBE_PARAM, token)
  return probed.href
}

async function fetchWithRetry(fetchImpl, url, init) {
  let lastError
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        ...init,
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          'user-agent': 'LibreChat-docs-cache-health/1.0',
          ...init?.headers,
        },
      })
      if (response.status < 500 || attempt === 3) return response
      lastError = new Error(`${url} returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 250))
    }
  }
  throw lastError
}

async function mapConcurrent(items, worker) {
  const results = new Array(items.length)
  let cursor = 0

  async function run() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await worker(items[index], index)
    }
  }

  const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, items.length) }, () => run())
  await Promise.all(workers)
  return results
}

export async function discoverCurrentBuildAssets({
  fetchImpl = fetch,
  origin = PRODUCTION_ORIGIN,
  probePaths = DEFAULT_PROBE_PATHS,
  token = `${Date.now()}`,
} = {}) {
  const pageResponses = await mapConcurrent(probePaths, async (path, index) => {
    const pageUrl = new URL(path, origin)
    const response = await fetchWithRetry(
      fetchImpl,
      withCacheProbe(pageUrl, `${token}-page-${index}`),
      { method: 'GET' },
    )
    if (!response.ok) {
      throw new DeploymentSkewError(
        `Fresh page probe failed for ${pageUrl.href}: HTTP ${response.status}`,
      )
    }
    return response.text()
  })

  const shellAssetLists = pageResponses.map((html) => extractBuildAssetUrls(html, origin))
  const shellAssets = [...new Set(shellAssetLists.flat())].sort()
  if (shellAssets.length === 0) {
    throw new Error('No Next.js build assets were found in the production page shells')
  }

  const runtimes = shellAssets.filter(isWebpackRuntime)
  if (runtimes.length === 0) {
    throw new Error('No Webpack runtime was found in the production page shells')
  }

  // Every shell of one build names the same runtime chunk. More than one answer
  // across shells fetched together means the alias served two builds during
  // this pass, so the union mixes both and its newest URLs may not be at the
  // origin yet. Shells without a runtime are ignored rather than counted as a
  // third answer.
  const runtimeSignatures = new Set(
    shellAssetLists.map((assets) => assets.filter(isWebpackRuntime).join(' ')).filter(Boolean),
  )
  if (runtimeSignatures.size > 1) {
    throw new DeploymentSkewError(
      `Production page shells disagree on the Webpack runtime (${[...runtimeSignatures].join(' vs ')}); the alias is still transitioning.`,
    )
  }

  const runtimeResponses = await mapConcurrent(runtimes, async (runtime, index) => {
    const response = await fetchWithRetry(
      fetchImpl,
      withCacheProbe(runtime, `${token}-runtime-${index}`),
      { method: 'GET' },
    )
    if (!response.ok) {
      throw new DeploymentSkewError(
        `Fresh Webpack runtime probe failed for ${runtime}: HTTP ${response.status}`,
      )
    }
    return response.text()
  })

  const runtimeAssets = runtimeResponses.flatMap((source) =>
    extractWebpackRuntimeAssetUrls(source, origin),
  )
  const assets = [...new Set([...shellAssets, ...runtimeAssets])].sort()
  return assets
}

/**
 * Runs discovery, retrying only the symptoms of an in-flight alias swap.
 *
 * The first automatic purge after live asset discovery shipped failed exactly
 * here: a shell fetched 15 seconds after Vercel reported ready still named the
 * previous build's runtime, which the alias had already stopped serving, and
 * the run aborted without purging anything. Retrying is what makes the settle
 * window self-correcting instead of a guess.
 *
 * @param {NonNullable<Parameters<typeof discoverCurrentBuildAssets>[0]> & {
 *   attempts?: number
 *   backoffMs?: number
 *   onRetry?: (error: Error, attempt: number) => void
 *   sleepImpl?: (ms: number) => Promise<unknown>
 * }} [options]
 */
export async function discoverCurrentBuildAssetsWithRetry({
  attempts = DISCOVERY_ATTEMPTS,
  backoffMs = DISCOVERY_BACKOFF_MS,
  onRetry,
  sleepImpl = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  ...options
} = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await discoverCurrentBuildAssets({
        ...options,
        token: `${options.token ?? Date.now()}-attempt-${attempt}`,
      })
    } catch (error) {
      if (!(error instanceof DeploymentSkewError) || attempt >= attempts) throw error
      onRetry?.(error, attempt)
      await sleepImpl(backoffMs * attempt)
    }
  }
}

async function main() {
  const token = process.env.CACHE_PROBE_TOKEN || `${Date.now()}-${process.pid}`
  const probePaths = process.env.CACHE_PROBE_PATHS
    ? process.env.CACHE_PROBE_PATHS.split(',')
        .map((path) => path.trim())
        .filter(Boolean)
    : DEFAULT_PROBE_PATHS
  const assets = await discoverCurrentBuildAssetsWithRetry({
    probePaths,
    token,
    onRetry: (error, attempt) => {
      process.stderr.write(
        `::warning::Alias still transitioning on attempt ${attempt}: ${error.message} Retrying.\n`,
      )
    },
  })

  process.stderr.write(
    `Collected ${assets.length} current build assets from ${probePaths.length} fresh page shells and their Webpack runtime.\n`,
  )
  process.stdout.write(`${assets.join('\n')}\n`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`::error::${error.message}\n`)
    process.exitCode = 1
  })
}
