import { useState, type FormEvent } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import validator from 'validator'
import style from './newsletterform.module.css'

const UnsubscribeForm = ({
  email: initialEmail = '',
  token = '',
}: {
  email?: string
  token?: string
}) => {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const hasSignedLink = validator.isEmail(email) && token.length > 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validator.isEmail(email)) {
      toast.error('Invalid email format')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        hasSignedLink ? '/api/unsubscribe' : '/api/unsubscribe/request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, token }),
        },
      )

      if (response.status === 200) {
        toast.success(
          hasSignedLink
            ? 'Unsubscription request received'
            : 'If that address is subscribed, an unsubscribe link has been sent',
        )
      } else {
        toast.error('Unsubscription failed')
      }
    } catch {
      toast.error('Unsubscription failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={style.container}>
      <br />
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className={style[`form-wrapper`]}>
        <h2 className={style[`form-title`]}>Unsubscribe From Our Newsletter</h2>
        <form onSubmit={handleSubmit} className={style[`form-container`]}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={style[`email-input`]}
            readOnly={hasSignedLink}
          />
          <button type="submit" className={style[`subscribe-button`]} disabled={isLoading}>
            {isLoading
              ? hasSignedLink
                ? 'Unsubscribing...'
                : 'Sending...'
              : hasSignedLink
                ? 'Unsubscribe'
                : 'Send unsubscribe link'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UnsubscribeForm
