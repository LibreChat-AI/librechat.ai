import validator from 'validator'
import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'
import crypto from 'crypto'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { NextApiRequest, NextApiResponse } from 'next'

interface EmailValidationResult {
  result: string
  engagement: {
    behavior: string
    isbot: boolean
    engaging: boolean
  }
  risk: string
  address: string
  did_you_mean: string | null
  reason: string[]
}

const mailgun = new Mailgun(FormData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
})

async function sendVerificationEmail(userEmail: string, link: string): Promise<void> {
  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: 'noreply@librechat.ai',
      to: userEmail,
      subject: 'Verify your email for our newsletter',
      html: `<p>Please verify your email by clicking the following link: <a href="${link}">here</a></p>`,
    })
    console.log('Email sent:', result)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

async function validateUserEmail(
  userEmail: string,
): Promise<{ isValid: boolean; reasons?: string[]; didYouMean?: string }> {
  try {
    const result = (await mg.validate.get(userEmail)) as unknown as EmailValidationResult
    console.log('Validation result:', result)
    const isValid =
      result.result === 'deliverable' && !result.engagement.isbot && result.risk === 'low'
    const reasons = isValid ? undefined : result.reason
    const didYouMean = result.did_you_mean
    return { isValid, reasons, didYouMean }
  } catch (error) {
    console.error('Failed to validate email:', error)
    return { isValid: false, reasons: ['Failed to validate email due to an error.'] }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method, body } = req

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email } = body

  if (!email || !validator.isEmail(email)) {
    return res.status(422).json({ message: 'Valid email is required' })
  }

  try {
    const { isValid, reasons, didYouMean } = await validateUserEmail(email)

    if (!isValid) {
      return res.status(422).json({
        message: 'Invalid email address',
        reasons,
        didYouMean,
      })
    }

    await dbConnect()

    const existingSubscriber = await Subscriber.findOne({ email })

    if (existingSubscriber) {
      return res.status(409).json({ message: 'Email already subscribed' })
    }

    const token = crypto.randomBytes(32).toString('hex')

    await new Subscriber({ email, token }).save()

    const verificationLink = `https://librechat.ai/api/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`

    await sendVerificationEmail(email, verificationLink)

    return res.status(201).json({ message: 'Verification email sent. Please check your inbox.' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Subscription failed' })
  }
}
