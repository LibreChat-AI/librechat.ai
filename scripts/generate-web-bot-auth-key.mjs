import { generateKeyPairSync } from 'node:crypto'

const { privateKey } = generateKeyPairSync('ed25519')
const privateJwk = privateKey.export({ format: 'jwk' })

process.stdout.write(
  [
    '# Store this value in the deployment secret manager. Do not commit it.',
    `WEB_BOT_AUTH_PRIVATE_JWK='${JSON.stringify(privateJwk)}'`,
    '',
  ].join('\n'),
)
