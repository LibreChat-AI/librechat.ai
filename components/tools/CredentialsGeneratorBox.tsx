'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, RefreshCw, ClipboardList } from 'lucide-react'
import useCredentialsGenerator from './credentialsGenerator'

const CREDENTIAL_FIELDS = [
  { key: 'CREDS_KEY', label: 'CREDS_KEY', hint: 'Encryption key for stored credentials' },
  { key: 'CREDS_IV', label: 'CREDS_IV', hint: 'Initialization vector for encryption' },
  { key: 'JWT_SECRET', label: 'JWT_SECRET', hint: 'Secret for signing access tokens' },
  {
    key: 'JWT_REFRESH_SECRET',
    label: 'JWT_REFRESH_SECRET',
    hint: 'Secret for signing refresh tokens',
  },
  { key: 'MEILI_KEY', label: 'MEILI_MASTER_KEY', hint: 'MeiliSearch master key' },
] as const

type CredentialKey = (typeof CREDENTIAL_FIELDS)[number]['key']
type Credentials = Record<CredentialKey, string>

export default function CredentialsGenerator() {
  const { generateCredentials } = useCredentialsGenerator()
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = () => {
    try {
      setCredentials(generateCredentials())
      setGenerated(true)
      setCopiedKey(null)
    } catch (error) {
      console.error((error as Error).message)
    }
  }

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }, [])

  const handleCopyAll = useCallback(() => {
    if (!credentials) return
    const block = CREDENTIAL_FIELDS.map((f) => `${f.label}=${credentials[f.key]}`).join('\n')
    copyToClipboard(block, 'all')
  }, [credentials, copyToClipboard])

  return (
    <div className="space-y-6">
      <button
        onClick={handleGenerate}
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-3 text-sm font-medium text-fd-primary-foreground transition-all hover:opacity-90 active:scale-[0.99]"
        aria-label="Generate new credentials"
      >
        <RefreshCw
          className={`size-4 transition-transform ${generated ? 'group-hover:rotate-180' : ''}`}
          aria-hidden="true"
        />
        {generated ? 'Regenerate Credentials' : 'Generate Credentials'}
      </button>

      {credentials && (
        <>
          <div
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            role="region"
            aria-label="Generated credentials"
          >
            {CREDENTIAL_FIELDS.map((field) => {
              const id = `cred-${field.key}`
              const isCopied = copiedKey === field.key
              return (
                <div
                  key={field.key}
                  className="group/field rounded-lg border border-fd-border bg-fd-card p-4 transition-colors hover:border-fd-primary/20"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor={id}
                      className="font-mono text-xs font-semibold text-fd-foreground"
                    >
                      {field.label}
                    </label>
                    <button
                      onClick={() => copyToClipboard(credentials[field.key], field.key)}
                      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
                      aria-label={`Copy ${field.label}`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-3 text-emerald-500" aria-hidden="true" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" aria-hidden="true" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mb-2 text-xs text-fd-muted-foreground">{field.hint}</p>
                  <input
                    id={id}
                    readOnly
                    value={credentials[field.key]}
                    className="w-full truncate rounded border border-fd-border bg-fd-muted px-3 py-2 font-mono text-xs text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
                    aria-label={`${field.label} value`}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-fd-border pt-4">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 rounded-lg border border-fd-border bg-fd-secondary px-4 py-2 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
              aria-label="Copy all credentials as .env block"
            >
              <ClipboardList className="size-4" aria-hidden="true" />
              {copiedKey === 'all' ? 'Copied to clipboard!' : 'Copy All as .env'}
            </button>
            <span aria-live="polite" className="text-xs text-fd-muted-foreground">
              {copiedKey === 'all' && 'All 5 credentials copied as KEY=value format'}
            </span>
          </div>
        </>
      )}

      {!credentials && (
        <div className="rounded-lg border border-dashed border-fd-border bg-fd-muted/50 px-6 py-12 text-center">
          <p className="text-sm text-fd-muted-foreground">
            Click the button above to generate secure random credentials for your{' '}
            <code className="rounded bg-fd-muted px-1.5 py-0.5 font-mono text-xs text-fd-foreground">
              .env
            </code>{' '}
            file.
          </p>
        </div>
      )}
    </div>
  )
}
