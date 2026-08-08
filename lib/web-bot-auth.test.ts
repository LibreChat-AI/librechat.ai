import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  verify,
  type JsonWebKey,
} from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createWebBotAuthDirectoryHeaders,
  createWebBotAuthRequestHeaders,
  getWebBotAuthPublicJwk,
  webBotAuthFetch,
} from './web-bot-auth'

function createPrivateJwk(): JsonWebKey {
  const { privateKey } = generateKeyPairSync('ed25519')
  return privateKey.export({ format: 'jwk' })
}

function extractSignature(value: string): Buffer {
  const encoded = value.match(/^sig1=:([^:]+):$/)?.[1]
  if (!encoded) throw new Error('Invalid Signature test value')
  return Buffer.from(encoded, 'base64')
}

function extractSignatureParameters(value: string): string {
  if (!value.startsWith('sig1=')) throw new Error('Invalid Signature-Input test value')
  return value.slice('sig1='.length)
}

describe('Web Bot Auth', () => {
  const originalPrivateJwk = process.env.WEB_BOT_AUTH_PRIVATE_JWK
  const originalAgentOrigin = process.env.WEB_BOT_AUTH_AGENT_ORIGIN
  let privateJwk: JsonWebKey

  beforeEach(() => {
    privateJwk = createPrivateJwk()
    process.env.WEB_BOT_AUTH_PRIVATE_JWK = JSON.stringify(privateJwk)
    process.env.WEB_BOT_AUTH_AGENT_ORIGIN = 'https://agent.example'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    process.env.WEB_BOT_AUTH_PRIVATE_JWK = originalPrivateJwk
    process.env.WEB_BOT_AUTH_AGENT_ORIGIN = originalAgentOrigin
  })

  it('derives a public JWKS entry and RFC 7638 thumbprint without exposing the private key', () => {
    const publicJwk = getWebBotAuthPublicJwk()
    const expectedThumbprint = createHash('sha256')
      .update(JSON.stringify({ crv: 'Ed25519', kty: 'OKP', x: privateJwk.x }))
      .digest('base64url')

    expect(publicJwk).toEqual({
      kty: 'OKP',
      crv: 'Ed25519',
      x: privateJwk.x,
      kid: expectedThumbprint,
      use: 'sig',
      alg: 'EdDSA',
    })
    expect(publicJwk).not.toHaveProperty('d')
  })

  it('creates a verifiable request signature covering the authority and Signature-Agent', () => {
    const headers = createWebBotAuthRequestHeaders('https://receiver.example:8443/crawl?q=docs')
    if (!headers) throw new Error('Expected Web Bot Auth headers')

    const signatureParameters = extractSignatureParameters(headers['Signature-Input'])
    const signatureBase =
      `"@authority": receiver.example:8443\n` +
      `"signature-agent": ${headers['Signature-Agent']}\n` +
      `"@signature-params": ${signatureParameters}`
    const publicKey = createPublicKey({ key: privateJwk, format: 'jwk' })

    expect(headers['Signature-Agent']).toBe('"https://agent.example"')
    expect(signatureParameters).toContain('("@authority" "signature-agent")')
    expect(signatureParameters).toContain(';tag="web-bot-auth"')
    expect(
      verify(null, Buffer.from(signatureBase), publicKey, extractSignature(headers.Signature)),
    ).toBe(true)
  })

  it('creates a verifiable self-signature for the key directory response', () => {
    const headers = createWebBotAuthDirectoryHeaders('www.librechat.ai')
    if (!headers) throw new Error('Expected Web Bot Auth directory headers')

    const signatureParameters = extractSignatureParameters(headers['Signature-Input'])
    const signatureBase =
      `"@authority";req: www.librechat.ai\n` + `"@signature-params": ${signatureParameters}`
    const publicKey = createPublicKey({ key: privateJwk, format: 'jwk' })

    expect(signatureParameters).toContain('("@authority";req)')
    expect(signatureParameters).toContain(';tag="http-message-signatures-directory"')
    expect(
      verify(null, Buffer.from(signatureBase), publicKey, extractSignature(headers.Signature)),
    ).toBe(true)
  })

  it('adds fresh signature headers to outbound fetch requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await webBotAuthFetch('https://receiver.example/resource', {
      headers: { Accept: 'application/json' },
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const forwardedInit = fetchMock.mock.calls[0][1] as RequestInit
    const forwardedHeaders = new Headers(forwardedInit.headers)
    expect(forwardedHeaders.get('Accept')).toBe('application/json')
    expect(forwardedHeaders.get('Signature-Agent')).toBe('"https://agent.example"')
    expect(forwardedHeaders.get('Signature-Input')).toContain('"signature-agent"')
    expect(forwardedHeaders.get('Signature')).toMatch(/^sig1=:[A-Za-z0-9+/]+=*:$/)
  })

  it('does not silently send unsigned agent requests when signing configuration is absent', async () => {
    delete process.env.WEB_BOT_AUTH_PRIVATE_JWK
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(webBotAuthFetch('https://receiver.example/resource')).rejects.toThrow(
      'WEB_BOT_AUTH_PRIVATE_JWK is required',
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(getWebBotAuthPublicJwk()).toBeNull()
  })
})
