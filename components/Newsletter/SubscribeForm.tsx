import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import validator from 'validator'
import style from './newsletterform.module.css'

const SubscribeForm = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validator.isEmail(email)) {
      toast.error('Valid email is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.status === 201) {
        toast.success('Subscription successful')
        setEmail('')
      } else if (response.status === 409) {
        toast.error('Email already subscribed')
      } else {
        toast.error('Subscription failed')
      }
    } catch (error) {
      toast.error('Subscription failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={style.container}>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className={style[`form-wrapper`]}>
        <h2 className={style[`form-title`]}>Subscribe to Our Newsletter</h2>
        <form onSubmit={handleSubmit} className={style[`form-container`]}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={style[`email-input`]}
          />
          <button type="submit" className={style[`subscribe-button`]} disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SubscribeForm
