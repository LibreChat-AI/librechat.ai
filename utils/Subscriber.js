import mongoose from 'mongoose'

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  token: {
    type: String,
    index: { expires: '7d' },
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema)

export default Subscriber
