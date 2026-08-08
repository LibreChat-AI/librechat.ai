import { NextRequest, type NextFetchEvent } from 'next/server'
import { describe, expect, it } from 'vitest'
import { LOCALIZED_HOME_LOCALES, LOCALE_COOKIE } from '@/lib/i18n'
import proxy, { preferredLocale } from '../proxy'

function requestWithPreferences({
  cookie,
  acceptLanguage,
}: {
  cookie?: string
  acceptLanguage?: string
}): NextRequest {
  return {
    cookies: {
      get: (name: string) => (name === LOCALE_COOKIE && cookie ? { value: cookie } : undefined),
    },
    headers: {
      get: (name: string) => (name.toLowerCase() === 'accept-language' ? acceptLanguage : null),
    },
  } as unknown as NextRequest
}

describe('preferredLocale', () => {
  it('honors implemented locale cookies for home preference', () => {
    const request = requestWithPreferences({
      cookie: 'pt-BR',
      acceptLanguage: 'de-DE,de;q=0.9',
    })

    expect(preferredLocale(request, LOCALIZED_HOME_LOCALES)).toBe('pt-BR')
  })

  it('uses Accept-Language when there is no locale cookie', () => {
    const request = requestWithPreferences({ acceptLanguage: 'de-DE,de;q=0.9' })

    expect(preferredLocale(request, LOCALIZED_HOME_LOCALES)).toBe('de')
  })

  it('ignores invalid locale cookies', () => {
    const request = requestWithPreferences({
      cookie: 'not-a-locale',
      acceptLanguage: 'fr-FR,fr;q=0.9',
    })

    expect(preferredLocale(request, LOCALIZED_HOME_LOCALES)).toBe('fr')
  })
})

describe('proxy routing', () => {
  const event = {} as NextFetchEvent

  async function runProxy(path: string, headers?: HeadersInit): Promise<Response> {
    const response = await proxy(
      new NextRequest(`https://www.librechat.ai${path}`, { headers }),
      event,
    )
    if (!response) throw new Error(`Proxy returned no response for ${path}`)
    return response
  }

  it('rewrites negotiated homepage requests to the curated Markdown index', async () => {
    const response = await runProxy('/', { accept: 'text/markdown' })

    expect(response.headers.get('x-middleware-rewrite')).toBe('https://www.librechat.ai/llms.txt')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('vary')).toBe('Accept')
  })

  it('keeps HTML as the default homepage representation', async () => {
    const response = await runProxy('/', { accept: 'text/html' })

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
    expect(response.headers.get('vary')).toContain('Accept')
  })

  it('rejects Markdown when its quality value is zero', async () => {
    const response = await runProxy('/', {
      accept: 'text/markdown;q=0, text/html;q=1',
    })

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('keeps HTML when it has a higher quality value than Markdown', async () => {
    const response = await runProxy('/docs/local/docker', {
      accept: 'text/markdown;q=0.5, text/html;q=1',
    })

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('serves Markdown when it has a higher quality value than HTML', async () => {
    const response = await runProxy('/docs/local/docker', {
      accept: 'text/html;q=0.5, text/markdown;q=1',
    })

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://www.librechat.ai/llms.mdx/docs/local/docker',
    )
  })

  it('passes browser requests for the explicit English route through unchanged', async () => {
    const response = await runProxy('/docs/local/docker', { accept: 'text/html' })

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
    expect(response.headers.get('vary')).toContain('Accept')
  })

  it('preserves content negotiation for raw Markdown', async () => {
    const response = await runProxy('/docs/local/docker', { accept: 'text/markdown' })

    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://www.librechat.ai/llms.mdx/docs/local/docker',
    )
  })

  it('leaves explicit .md routes for the Next.js raw Markdown rewrite', async () => {
    const response = await runProxy('/docs/local/docker.md', { accept: 'text/markdown' })

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('redirects the prefixed default locale to the canonical English URL', async () => {
    const response = await runProxy('/en/docs/quick_start')

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://www.librechat.ai/docs/quick_start')
  })

  it('passes localized docs routes through with their visible prefix', async () => {
    const response = await runProxy('/it/docs/translation')

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })
})
