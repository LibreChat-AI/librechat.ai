import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import validator from 'validator'
import style from './newsletterform.module.css'

const isDevelopment = false

const SubscribeForm = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!validator.isEmail(email)) {
      toast.error('Valid email is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      handleSubscribeResponse(response)
    } catch (error) {
      toast.error('Subscription failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribeResponse = async (response) => {
    if (response.status === 201) {
      toast.success('Subscription successful, check your email to verify your subscription')
      setEmail('')
      return
    }

    if (response.status === 409) {
      toast.error('Email already subscribed')
      return
    }

    const data = await response.json()
    if (data.reasons?.length > 0) {
      toast.error(`Subscription failed: ${data.reasons.join(', ')}`)
    } else if (data.didYouMean) {
      toast.error(`Subscription failed. Did you mean: ${data.didYouMean}?`)
    } else {
      toast.error('Subscription failed')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSubscribe()
  }

  return (
    <div className={style.container}>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className={style['form-wrapper']}>
        <h2 className={style['form-title']}>Subscribe to Our Newsletter</h2>
        <form onSubmit={handleSubmit} className={style['form-container']}>
          <input
            type="email"
            placeholder={isDevelopment ? 'Coming soon...' : 'Enter your email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={style['email-input']}
            readOnly={isDevelopment}
          />
          <button
            type="submit"
            className={style['subscribe-button']}
            disabled={isLoading || isDevelopment}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SubscribeForm
