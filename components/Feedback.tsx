'use client'

import { useEffect, useState, useTransition, type SyntheticEvent } from 'react'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Collapsible, CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible'
import { submitFeedback } from '@/app/actions/feedback'

type Opinion = 'good' | 'bad'

interface StoredFeedback {
  opinion: Opinion
  message: string
  url: string
}

function useStoredFeedback(url: string) {
  const key = `docs-feedback-${url}`
  const [stored, setStored] = useState<StoredFeedback | null>(null)

  useEffect(() => {
    const item = localStorage.getItem(key)
    if (!item) return
    try {
      const parsed = JSON.parse(item) as StoredFeedback
      if (parsed.opinion && parsed.url) setStored(parsed)
    } catch {
      // ignore invalid data
    }
  }, [key])

  function save(feedback: StoredFeedback | null) {
    if (feedback) {
      localStorage.setItem(key, JSON.stringify(feedback))
    } else {
      localStorage.removeItem(key)
    }
    setStored(feedback)
  }

  return { stored, save }
}

export function Feedback() {
  const url = usePathname() ?? '/'
  const { stored, save } = useStoredFeedback(url)
  const [opinion, setOpinion] = useState<Opinion | null>(null)
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  function submit(e?: SyntheticEvent) {
    if (!opinion) return
    e?.preventDefault()

    const payload = { opinion, message, url }
    save(payload)
    setMessage('')
    setOpinion(null)

    startTransition(async () => {
      await submitFeedback(payload)
    })
  }

  const activeOpinion = stored?.opinion ?? opinion

  return (
    <Collapsible
      open={opinion !== null || stored !== null}
      onOpenChange={(open) => {
        if (!open) setOpinion(null)
      }}
      className="not-prose border-y border-fd-border py-3"
    >
      <div className="flex flex-row items-center gap-2">
        <p className="pe-2 text-sm font-medium text-fd-foreground">How is this guide?</p>
        <button
          disabled={stored !== null}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4 ${
            activeOpinion === 'good'
              ? 'border-fd-border bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current'
              : 'border-fd-border text-fd-muted-foreground hover:bg-fd-accent'
          } disabled:cursor-not-allowed`}
          onClick={() => setOpinion('good')}
          aria-label="Good"
        >
          <ThumbsUp />
          Good
        </button>
        <button
          disabled={stored !== null}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors [&_svg]:size-4 ${
            activeOpinion === 'bad'
              ? 'border-fd-border bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current'
              : 'border-fd-border text-fd-muted-foreground hover:bg-fd-accent'
          } disabled:cursor-not-allowed`}
          onClick={() => setOpinion('bad')}
          aria-label="Bad"
        >
          <ThumbsDown />
          Bad
        </button>
      </div>
      <CollapsibleContent className="mt-3">
        {stored ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-fd-card px-3 py-6 text-center text-sm text-fd-muted-foreground">
            <p className="flex items-center gap-2">
              {pending && <Loader2 className="size-3.5 animate-spin" />}
              Thank you for your feedback!
            </p>
            <button
              className="rounded-md border border-fd-border px-3 py-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent"
              onClick={() => {
                setOpinion(stored.opinion)
                save(null)
              }}
            >
              Submit again
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-lg border border-fd-border bg-fd-secondary p-3 text-sm text-fd-secondary-foreground placeholder:text-fd-muted-foreground focus-visible:outline-none"
              placeholder="Any additional feedback? (optional)"
              rows={3}
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === 'Enter') {
                  submit(e)
                }
              }}
            />
            <button
              type="submit"
              className="w-fit rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
            >
              Submit
            </button>
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
