import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'

export default async function handler(req, res) {
  const { method, query } = req

  if (method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email, token } = query

  if (!email || !token) {
    return res.status(400).json({ message: 'Email and token are required' })
  }

  try {
    await dbConnect()

    const subscriber = await Subscriber.findOne({ email, token })

    if (!subscriber) {
      return res.status(404).json({ message: 'Invalid email or token' })
    }

    if (!subscriber.token) {
      return res.status(400).json({ message: 'Token expired' })
    }

    subscriber.status = 'subscribed'
    subscriber.token = undefined
    await subscriber.save()

    return res.status(200).json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ message: 'Verification failed' })
  }
}
