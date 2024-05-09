import validator from 'validator'
import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'

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
    await dbConnect()

    const existingSubscriber = await Subscriber.findOne({ email })

    if (existingSubscriber) {
      return res.status(409).json({ message: 'Email already subscribed' })
    }

    const newSubscriber = new Subscriber({ email })
    await newSubscriber.save()

    return res.status(201).json({ message: 'Subscription successful' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Subscription failed' })
  }
}
