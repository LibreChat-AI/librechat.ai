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
    required: false,
  },
  tokenExpires: {
    type: Date,
    index: { expires: '7d' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema)

export default Subscriber
