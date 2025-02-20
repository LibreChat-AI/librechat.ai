import mongoose, { Schema, Model, Document } from 'mongoose'

interface ISubscriber extends Document {
  email: string
  status: string
}

const SubscriberSchema = new Schema({
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

const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema)

export default Subscriber
