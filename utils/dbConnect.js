/* eslint-disable no-undef */

import mongoose from 'mongoose'

async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.debug('MongoDB connection already established.')
      return
    }

    console.debug('Connecting to MongoDB...')
    mongoose.set('debug', true)
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.debug('MongoDB connection successful.')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error // Rethrow the error to handle it in the calling code
  }
}

export default dbConnect
