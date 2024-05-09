import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'
import validator from 'validator'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    try {
      await dbConnect()
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ message: 'Unsubscription failed' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
