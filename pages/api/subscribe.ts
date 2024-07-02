import validator from 'validator'
import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'
import { createMailgunClient } from 'mailgun-utility'
import crypto from 'crypto'

const mailgunClient = createMailgunClient(process.env.MAILGUN_DOMAIN, process.env.MAILGUN_API_KEY)

async function sendVerificationEmail(userEmail: string, link: string) {
  try {
    const result = await mailgunClient.sendEmail({
      from: 'noreply@librechat.ai',
      to: userEmail,
      subject: 'Verify your email for our newsletter',
      html: `<p>Please verify your email by clicking the following link: <a href="${link}" >here</a></p>`,
    })
    console.log('Email sent:', result)
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

async function validateUserEmail(userEmail: string) {
  try {
    const result = await mailgunClient.validateEmail(userEmail)
    console.log('Validation result:', result)
    return result.is_valid
  } catch (error) {
    console.error('Failed to validate email:', error)
    return false
  }
}

export default async function handler(req, res) {
  const { method, body } = req

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email } = body

  if (!email || !validator.isEmail(email)) {
    return res.status(422).json({ message: 'Valid email is required' })
  }

  try {
    const isEmailValid = await validateUserEmail(email)

    if (!isEmailValid) {
      return res.status(422).json({ message: 'Invalid email address' })
    }

    await dbConnect()

    const existingSubscriber = await Subscriber.findOne({ email })

    if (existingSubscriber) {
      return res.status(409).json({ message: 'Email already subscribed' })
    }

    const token: string = crypto.randomBytes(32).toString('hex')

    await new Subscriber({ email, token })

    // const newSubscriber = new Subscriber({ email })
    // await newSubscriber.save()

    // Send verification email

    const verificationLink = `https://librechat.ai/api/verify?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`

    await sendVerificationEmail(email, verificationLink)

    return res.status(201).json({ message: 'Verification email sent. Please check your inbox.' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Subscription failed' })
  }
}
