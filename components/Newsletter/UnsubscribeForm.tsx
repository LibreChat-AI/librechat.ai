import { useState, type FormEvent } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import validator from 'validator'
import style from './newsletterform.module.css'

const UnsubscribeForm = ({ email = '', token = '' }: { email?: string; token?: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const hasSignedLink = validator.isEmail(email) && token.length > 0

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!hasSignedLink) {
      toast.error('This unsubscribe link is invalid')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      })

      if (response.status === 200) {
        toast.success('Unsubscription successful')
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
            className={style[`email-input`]}
            readOnly
          />
          <button
            type="submit"
            className={style[`subscribe-button`]}
            disabled={isLoading || !hasSignedLink}
          >
            {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UnsubscribeForm
