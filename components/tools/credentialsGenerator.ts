import crypto from 'crypto'

const credentialsGenerator = () => {
  const generateRandomHex = (length) => {
    return crypto.randomBytes(length).toString('hex')
  }

  const generateCredentials = () => {
    const keyLength = 32
    const ivLength = 16
    const jwtLength = 32
    const meiliLenght = 16

    const key = generateRandomHex(keyLength)
    const iv = generateRandomHex(ivLength)
    const jwt = generateRandomHex(jwtLength)
    const jwt2 = generateRandomHex(jwtLength)
    const meili = generateRandomHex(meiliLenght)

    return {
      CREDS_KEY: key,
      CREDS_IV: iv,
      JWT_SECRET: jwt,
      JWT_REFRESH_SECRET: jwt2,
      MEILI_KEY: meili,
    }
  }

  return { generateCredentials }
}

export default credentialsGenerator
