/* eslint-disable no-undef */

import mongoose from 'mongoose'

/** Connect to MongoDB using MONGODB_URI env var. Reuses existing connections if already connected. */
async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.debug('MongoDB connection already established.')
      return
    }

    console.debug('Connecting to MongoDB...')
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true)
    }
    await mongoose.connect(process.env.MONGODB_URI)
    console.debug('MongoDB connection successful.')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error // Rethrow the error to handle it in the calling code
  }
}

export default dbConnect
