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
    default: 'subscribed',
  },
})

const Subscriber = mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema)

export default Subscriber
