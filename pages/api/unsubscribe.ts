import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'
import validator from 'validator'

/**
 * POST /api/unsubscribe - Unsubscribe an email from the newsletter.
 * Body: { email: string }
 * Responses: 200 OK, 400 Invalid email, 404 Subscriber not found, 405 Method Not Allowed.
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    try {
      await dbConnect()
    } catch {
      return res.status(500).json({ message: 'Database connection failed' })
    }

    try {
      const updatedSubscriber = await Subscriber.findOneAndUpdate(
        { email },
        { status: 'unsubscribed' },
        { new: true },
      )

      if (updatedSubscriber) {
        res.status(200).json({ message: 'Unsubscription successful' })
      } else {
        res.status(404).json({ message: 'Subscriber not found' })
      }
    } catch {
      res.status(500).json({ message: 'Unsubscription failed' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
