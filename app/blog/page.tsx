import Image from 'next/image'
import Link from 'next/link'
import { blog } from '@/lib/source'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest news and guides from the LibreChat team.',
}

interface FeedEntry {
  title: string
  description?: string
  date: string
  url: string
  category: string
  author?: string
  ogImage?: string
}

function getSlug(path: string): string {
  return path.replace(/\.mdx?$/, '')
}

export default function BlogPage() {
  const entries: FeedEntry[] = []

  for (const post of blog) {
    entries.push({
      title: post.title,
      description: post.description,
      date:
        typeof post.date === 'string' ? post.date : new Date(post.date).toISOString().split('T')[0],
      url: `/blog/${getSlug(post._file.path)}`,
      category: (post as any).category ?? 'guide',
      author: (post as any).author,
      ogImage: post.ogImage,
    })
  }

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Latest news and guides from the LibreChat team.
        </p>
      </header>

      <div className="space-y-4">
        {entries.map((entry) => (
          <article key={entry.url}>
            <Link
              href={entry.url}
              className="group flex flex-col gap-2 rounded-lg border border-border overflow-hidden transition-colors hover:bg-muted"
            >
              {entry.ogImage && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={entry.ogImage}
                    alt={entry.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized={entry.ogImage.endsWith('.gif')}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 p-6">
                <div className="flex items-center gap-3">
                  <time dateTime={entry.date} className="text-sm text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                    {entry.category}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-foreground/80">
                  {entry.title}
                </h2>
                {entry.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
                )}
                {entry.author && <p className="text-xs text-muted-foreground">by {entry.author}</p>}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
