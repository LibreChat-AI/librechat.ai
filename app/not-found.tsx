import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-xl text-fd-muted-foreground">Page not found</h2>
      <p className="max-w-md text-center text-sm text-fd-muted-foreground">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Link
        href="/"
        className="rounded-md bg-fd-primary px-4 py-2 text-sm text-fd-primary-foreground hover:opacity-90"
      >
        Go home
      </Link>
    </main>
  )
}
