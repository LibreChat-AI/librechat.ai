'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const CONSENT_KEY = 'librechat_reo_consent'
const CONSENT_GRANTED = 'granted'
const CONSENT_DENIED = 'denied'
const REO_SCRIPT_ID = 'reo-analytics'
const REO_COOKIE_NAMES = [
  '__sec__cid',
  '__sec__fid',
  '__sec__ghost',
  '__sec__token',
  '__sec__crid',
  '__sec__tid',
]

type Consent = typeof CONSENT_GRANTED | typeof CONSENT_DENIED | null

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean
  }

  interface Window {
    Reo?: {
      init: (options: { clientID: string }) => void
    }
  }
}

function storedConsent(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY)
    return value === CONSENT_GRANTED || value === CONSENT_DENIED ? value : null
  } catch {
    return null
  }
}

function persistConsent(value: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // Consent still applies for this page when storage is unavailable.
  }
}

function privacySignalEnabled() {
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'
}

function clearReoCookies() {
  const { hostname } = window.location
  const registrableDomain = hostname.endsWith('.librechat.ai') ? '.librechat.ai' : hostname
  const domains = new Set(['', hostname, registrableDomain])

  for (const name of REO_COOKIE_NAMES) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`
    }
  }
}

function loadReo(clientId: string) {
  if (document.getElementById(REO_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = REO_SCRIPT_ID
  script.src = `https://static.reo.dev/${clientId}/reo.js`
  script.defer = true
  script.onload = () => {
    if (window.Reo && typeof window.Reo.init === 'function') {
      window.Reo.init({ clientID: clientId })
    }
  }
  document.head.appendChild(script)
}

export function ReoAnalyticsConsent({ clientId }: { clientId: string }) {
  const [consent, setConsent] = useState<Consent>(null)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let initialConsent = storedConsent()
    if (initialConsent === null && privacySignalEnabled()) {
      initialConsent = CONSENT_DENIED
      persistConsent(initialConsent)
    }

    setConsent(initialConsent)
    setPreferencesOpen(initialConsent === null)
    setReady(true)

    if (initialConsent === CONSENT_GRANTED) {
      loadReo(clientId)
    }
  }, [clientId])

  const grantConsent = useCallback(() => {
    persistConsent(CONSENT_GRANTED)
    setConsent(CONSENT_GRANTED)
    setPreferencesOpen(false)
    loadReo(clientId)
  }, [clientId])

  const denyConsent = useCallback(() => {
    const hadConsent = consent === CONSENT_GRANTED
    persistConsent(CONSENT_DENIED)
    clearReoCookies()
    setConsent(CONSENT_DENIED)
    setPreferencesOpen(false)

    // Once loaded, Reo installs page-level listeners. Reloading guarantees that
    // withdrawing consent stops collection for the remainder of the visit.
    if (hadConsent) {
      window.location.reload()
    }
  }, [consent])

  if (!ready) return null

  return (
    <>
      {preferencesOpen && (
        <section
          role="dialog"
          aria-labelledby="analytics-consent-title"
          aria-describedby="analytics-consent-description"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-xl border border-border bg-background p-5 shadow-2xl sm:p-6"
        >
          <h2 id="analytics-consent-title" className="text-lg font-semibold text-foreground">
            Performance analytics preferences
          </h2>
          <p
            id="analytics-consent-description"
            className="mt-2 text-sm leading-6 text-muted-foreground"
          >
            With your permission, LibreChat uses Reo.dev performance analytics to understand which
            website and documentation pages developers use. Reo.dev sets first-party cookies and
            receives page and interaction data. Declining does not affect the site. Read our{' '}
            <Link href="/cookie" className="underline underline-offset-2 hover:text-foreground">
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={denyConsent}>
              Reject non-essential
            </Button>
            <Button type="button" onClick={grantConsent}>
              Accept performance analytics
            </Button>
          </div>
        </section>
      )}

      {!preferencesOpen && consent !== null && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPreferencesOpen(true)}
          className="fixed bottom-4 left-4 z-[90] bg-background shadow-md"
        >
          Cookie preferences
        </Button>
      )}
    </>
  )
}
