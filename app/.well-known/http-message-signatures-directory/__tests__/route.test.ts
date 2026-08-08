import { createPublicKey, generateKeyPairSync, verify, type JsonWebKey } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GET } from '../route'

function extractSignature(value: string): Buffer {
  const encoded = value.match(/^sig1=:([^:]+):$/)?.[1]
  if (!encoded) throw new Error('Invalid Signature test value')
  return Buffer.from(encoded, 'base64')
}

describe('GET /.well-known/http-message-signatures-directory', () => {
  const originalPrivateJwk = process.env.WEB_BOT_AUTH_PRIVATE_JWK
  let privateJwk: JsonWebKey

  beforeEach(() => {
    const { privateKey } = generateKeyPairSync('ed25519')
    privateJwk = privateKey.export({ format: 'jwk' })
    process.env.WEB_BOT_AUTH_PRIVATE_JWK = JSON.stringify(privateJwk)
  })

  afterEach(() => {
    process.env.WEB_BOT_AUTH_PRIVATE_JWK = originalPrivateJwk
  })

  it('publishes a signed JWKS containing the configured public key', async () => {
    const response = await GET(
      new Request('https://www.librechat.ai/.well-known/http-message-signatures-directory'),
    )
    const body = (await response.json()) as { keys: JsonWebKey[] }

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe(
      'application/http-message-signatures-directory+json',
    )
    expect(body.keys).toHaveLength(1)
    expect(body.keys[0]).toMatchObject({ kty: 'OKP', crv: 'Ed25519', x: privateJwk.x })
    expect(body.keys[0]).not.toHaveProperty('d')

    const signatureInput = response.headers.get('Signature-Input')
    const signatureHeader = response.headers.get('Signature')
    if (!signatureInput || !signatureHeader) throw new Error('Expected directory signature')

    const signatureParameters = signatureInput.slice('sig1='.length)
    const signatureBase =
      `"@authority";req: www.librechat.ai\n` + `"@signature-params": ${signatureParameters}`
    const publicKey = createPublicKey({ key: body.keys[0], format: 'jwk' })

    expect(
      verify(null, Buffer.from(signatureBase), publicKey, extractSignature(signatureHeader)),
    ).toBe(true)
  })

  it('returns 503 instead of publishing an empty key set when the key is missing', async () => {
    delete process.env.WEB_BOT_AUTH_PRIVATE_JWK

    const response = await GET(
      new Request('https://www.librechat.ai/.well-known/http-message-signatures-directory'),
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'Web Bot Auth signing key is not configured' })
  })
})
