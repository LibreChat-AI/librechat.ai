'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-fd-muted-foreground">An unexpected error occurred.</p>
      <nav className="flex gap-3" aria-label="Error recovery options">
        <button
          onClick={reset}
          className="rounded-md bg-fd-primary px-4 py-2 text-sm text-fd-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-fd-border px-4 py-2 text-sm hover:bg-fd-accent"
        >
          Go home
        </Link>
      </nav>
    </main>
  )
}
