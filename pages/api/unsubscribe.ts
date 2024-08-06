import dbConnect from '@/utils/dbConnect'
import Subscriber from '@/utils/Subscriber'
import validator from 'validator'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(FormData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
})

async function deleteUser(email: string): Promise<void> {
  try {
    const result = await mg.lists.members.destroyMember(process.env.MAILGUN_LIST, email)
    console.log('Member deleted:', result)
  } catch (error) {
    console.error('Failed to delete member:', error)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email } = req.body

  if (!email || !validator.isEmail(email)) {
    return res.status(422).json({ message: 'Valid email is required' })
  }

  try {
    await dbConnect()

    const dbSubscriber = await Subscriber.findOneAndDelete({ email })

    if (!dbSubscriber) {
      res.status(404).json({ message: 'Subscriber not found' })
    }

    const deleteMailgunMember = deleteUser(email)

    if (!deleteMailgunMember) {
      res.status(500).json({ message: 'Unsubscription failed' })
    }

    res.status(200).json({ message: 'Unsubscription successful' })
  } catch (error) {
    res.status(500).json({ message: 'Unsubscription failed' })
  }
}
