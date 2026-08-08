import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomBytes,
  sign,
  type JsonWebKey,
  type KeyObject,
} from 'node:crypto'

export const WEB_BOT_AUTH_DIRECTORY_PATH = '/.well-known/http-message-signatures-directory'

const DEFAULT_SIGNATURE_AGENT_ORIGIN = 'https://www.librechat.ai'
const REQUEST_SIGNATURE_LIFETIME_SECONDS = 60
const DIRECTORY_SIGNATURE_LIFETIME_SECONDS = 300
const SIGNATURE_LABEL = 'sig1'

interface Ed25519PrivateJwk extends JsonWebKey {
  kty: 'OKP'
  crv: 'Ed25519'
  x: string
  d: string
}

export interface WebBotAuthPublicJwk {
  kty: 'OKP'
  crv: 'Ed25519'
  x: string
  kid: string
  use: 'sig'
  alg: 'EdDSA'
}

interface WebBotAuthKeyMaterial {
  privateKey: KeyObject
  publicJwk: WebBotAuthPublicJwk
  thumbprint: string
}

function parsePrivateJwk(value: string): Ed25519PrivateJwk {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('WEB_BOT_AUTH_PRIVATE_JWK must be valid JSON')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('kty' in parsed) ||
    parsed.kty !== 'OKP' ||
    !('crv' in parsed) ||
    parsed.crv !== 'Ed25519' ||
    !('x' in parsed) ||
    typeof parsed.x !== 'string' ||
    !('d' in parsed) ||
    typeof parsed.d !== 'string'
  ) {
    throw new Error('WEB_BOT_AUTH_PRIVATE_JWK must contain an Ed25519 private JWK')
  }

  return parsed as Ed25519PrivateJwk
}

function calculateThumbprint(jwk: Pick<WebBotAuthPublicJwk, 'crv' | 'kty' | 'x'>): string {
  const canonicalJwk = JSON.stringify({ crv: jwk.crv, kty: jwk.kty, x: jwk.x })
  return createHash('sha256').update(canonicalJwk).digest('base64url')
}

function getKeyMaterial(): WebBotAuthKeyMaterial | null {
  const privateJwkValue = process.env.WEB_BOT_AUTH_PRIVATE_JWK
  if (!privateJwkValue) return null

  const privateJwk = parsePrivateJwk(privateJwkValue)
  const privateKey = createPrivateKey({ key: privateJwk, format: 'jwk' })
  const exportedPublicJwk = createPublicKey(privateKey).export({ format: 'jwk' })

  if (
    exportedPublicJwk.kty !== 'OKP' ||
    exportedPublicJwk.crv !== 'Ed25519' ||
    typeof exportedPublicJwk.x !== 'string'
  ) {
    throw new Error('WEB_BOT_AUTH_PRIVATE_JWK did not produce an Ed25519 public key')
  }

  const thumbprint = calculateThumbprint({
    crv: 'Ed25519',
    kty: 'OKP',
    x: exportedPublicJwk.x,
  })

  return {
    privateKey,
    thumbprint,
    publicJwk: {
      kty: 'OKP',
      crv: 'Ed25519',
      x: exportedPublicJwk.x,
      kid: thumbprint,
      use: 'sig',
      alg: 'EdDSA',
    },
  }
}

function serializeString(value: string): string {
  if (/[^\x20-\x7E]/.test(value)) {
    throw new Error('Web Bot Auth signature parameters must contain only printable ASCII')
  }

  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function signatureHeader(signatureBase: string, privateKey: KeyObject): string {
  const signature = sign(null, Buffer.from(signatureBase), privateKey).toString('base64')
  return `${SIGNATURE_LABEL}=:${signature}:`
}

function getSignatureAgentOrigin(): string {
  const configuredOrigin = process.env.WEB_BOT_AUTH_AGENT_ORIGIN?.trim()
  const url = new URL(configuredOrigin || DEFAULT_SIGNATURE_AGENT_ORIGIN)

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('WEB_BOT_AUTH_AGENT_ORIGIN must be an HTTPS origin without a path')
  }

  return url.origin
}

export function getWebBotAuthPublicJwk(): WebBotAuthPublicJwk | null {
  return getKeyMaterial()?.publicJwk ?? null
}

export function createWebBotAuthRequestHeaders(
  target: string | URL,
): Record<string, string> | null {
  const keyMaterial = getKeyMaterial()
  if (!keyMaterial) return null

  const targetUrl = new URL(target)
  const created = Math.floor(Date.now() / 1000)
  const expires = created + REQUEST_SIGNATURE_LIFETIME_SECONDS
  const nonce = randomBytes(32).toString('base64')
  // Cloudflare currently implements directory draft 03, where Signature-Agent
  // is a structured string. Later dictionary forms are rejected by its verifier.
  const signatureAgent = serializeString(getSignatureAgentOrigin())
  const signatureParameters =
    `("@authority" "signature-agent");created=${created}` +
    `;keyid=${serializeString(keyMaterial.thumbprint)};alg="ed25519";expires=${expires}` +
    `;nonce=${serializeString(nonce)};tag="web-bot-auth"`
  const signatureBase =
    `"@authority": ${targetUrl.host}\n` +
    `"signature-agent": ${signatureAgent}\n` +
    `"@signature-params": ${signatureParameters}`

  return {
    'Signature-Agent': signatureAgent,
    'Signature-Input': `${SIGNATURE_LABEL}=${signatureParameters}`,
    Signature: signatureHeader(signatureBase, keyMaterial.privateKey),
  }
}

export function createWebBotAuthDirectoryHeaders(authority: string): Record<string, string> | null {
  const keyMaterial = getKeyMaterial()
  if (!keyMaterial) return null

  const created = Math.floor(Date.now() / 1000)
  const expires = created + DIRECTORY_SIGNATURE_LIFETIME_SECONDS
  const nonce = randomBytes(32).toString('base64')
  const signatureParameters =
    `("@authority";req);alg="ed25519";keyid=${serializeString(keyMaterial.thumbprint)}` +
    `;nonce=${serializeString(nonce)};tag="http-message-signatures-directory"` +
    `;created=${created};expires=${expires}`
  const signatureBase =
    `"@authority";req: ${authority}\n` + `"@signature-params": ${signatureParameters}`

  return {
    'Signature-Input': `${SIGNATURE_LABEL}=${signatureParameters}`,
    Signature: signatureHeader(signatureBase, keyMaterial.privateKey),
  }
}

export const webBotAuthFetch: typeof fetch = async (input, init) => {
  const target = input instanceof Request ? input.url : input.toString()
  const authHeaders = createWebBotAuthRequestHeaders(target)
  if (!authHeaders) {
    throw new Error('WEB_BOT_AUTH_PRIVATE_JWK is required to send agent requests')
  }

  const headers = new Headers(input instanceof Request ? input.headers : undefined)
  const initHeaders = new Headers(init?.headers)
  for (const [name, value] of initHeaders) headers.set(name, value)
  for (const [name, value] of Object.entries(authHeaders)) headers.set(name, value)

  return fetch(input, { ...init, headers })
}
