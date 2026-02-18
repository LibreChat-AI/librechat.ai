const credentialsGenerator = () => {
  const generateRandomHex = (byteLength: number): string => {
    const bytes = new Uint8Array(byteLength)
    window.crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  }

  const generateCredentials = () => ({
    CREDS_KEY: generateRandomHex(32),
    CREDS_IV: generateRandomHex(16),
    JWT_SECRET: generateRandomHex(32),
    JWT_REFRESH_SECRET: generateRandomHex(32),
    MEILI_KEY: generateRandomHex(16),
  })

  return { generateCredentials }
}

export default credentialsGenerator
