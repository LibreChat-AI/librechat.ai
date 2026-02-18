import Image from 'next/image'
import Link from 'next/link'
import { authors } from '@/lib/authors'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authors',
  description: 'Get to know the talented people behind LibreChat.',
  openGraph: {
    title: 'Authors | LibreChat',
    description: 'Get to know the talented people behind LibreChat.',
  },
}

export default function AuthorsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Our Authors</h1>
        <p className="mt-3 text-fd-muted-foreground">
          Get to know the talented people behind LibreChat.
        </p>
      </header>
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Authors list">
        {authors.map((author) => (
          <article
            key={author.id}
            className="group rounded-lg border border-fd-border bg-fd-card p-6 transition-colors hover:bg-fd-accent"
          >
            <Link href={`/authors/${author.id}`} className="flex flex-col items-center text-center">
              <Image
                src={author.avatar}
                alt={`${author.name}'s profile picture`}
                width={80}
                height={80}
                className="rounded-full"
              />
              <h2 className="mt-4 text-lg font-semibold">{author.name}</h2>
              <p className="mt-1 text-sm text-fd-muted-foreground">{author.subtitle}</p>
              <p className="mt-3 line-clamp-3 text-sm text-fd-muted-foreground">{author.bio}</p>
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
