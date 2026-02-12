import type { NextApiRequest, NextApiResponse } from 'next'
import validator from 'validator'
import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'

type ResponseData = {
  message: string
}

/**
 * POST /api/subscribe - Add a newsletter subscriber.
 * Body: { email: string }
 * Responses: 201 Created, 409 Conflict (already subscribed), 422 Invalid email, 405 Method Not Allowed.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { method, body } = req

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email } = body

  if (!email || !validator.isEmail(email)) {
    return res.status(422).json({ message: 'Valid email is required' })
  }

  try {
    await dbConnect()

    const existingSubscriber = await Subscriber.findOne({ email })

    if (existingSubscriber) {
      return res.status(409).json({ message: 'Email already subscribed' })
    }

    const newSubscriber = new Subscriber({ email })
    await newSubscriber.save()

    return res.status(201).json({ message: 'Subscription successful' })
  } catch (error) {
    console.error('Subscription error:', error.message)
    return res.status(500).json({ message: 'Subscription failed' })
  }
}
