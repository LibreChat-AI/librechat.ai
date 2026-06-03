import Image from 'next/image'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import { getAuthorById } from '@/lib/authors'
import { blog } from '@/lib/source'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest news and guides from the LibreChat team.',
}

interface FeedEntry {
  title: string
  description?: string
  date: string
  dateFormatted: string
  url: string
  authorName?: string
  authorSubtitle?: string
  authorAvatar?: string
  ogImage?: string
  ogImagePosition?: string
  featured?: boolean
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

function getSlug(path: string): string {
  return path.replace(/\.mdx?$/, '')
}

export default function BlogPage() {
  const entries: FeedEntry[] = []

  for (const post of blog) {
    const iso =
      typeof post.date === 'string' ? post.date : new Date(post.date).toISOString().split('T')[0]
    const author = post.author ? getAuthorById(post.author) : undefined
    entries.push({
      title: post.title,
      description: post.description,
      date: iso,
      dateFormatted: dateFormatter.format(new Date(iso + 'T00:00:00Z')),
      url: `/blog/${getSlug(post.info.path)}`,
      authorName: author?.name ?? post.author,
      authorSubtitle: author?.subtitle,
      authorAvatar: author?.avatar,
      ogImage: post.ogImage,
      ogImagePosition: post.ogImagePosition,
      featured: post.featured,
    })
  }

  entries.sort((a, b) => {
    if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Latest news and guides from the LibreChat team.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {entries.map((entry) => (
          <article key={entry.url} className={cn(entry.featured && 'md:col-span-2')}>
            <Link
              href={entry.url}
              className={cn(
                'group flex h-full flex-col rounded-lg border border-border overflow-hidden transition-colors hover:bg-muted',
                entry.featured && 'border-primary/40 ring-1 ring-primary/20',
              )}
            >
              <div
                className={cn(
                  'relative w-full overflow-hidden bg-muted',
                  entry.featured ? 'h-56 md:h-72' : 'h-48',
                )}
              >
                {entry.featured && (
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">
                    <Pin className="size-3" aria-hidden="true" />
                    Pinned
                  </span>
                )}
                {entry.ogImage ? (
                  <Image
                    src={entry.ogImage}
                    alt={entry.title}
                    fill
                    sizes={entry.featured ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                    className="object-cover transition-transform group-hover:scale-105"
                    style={
                      entry.ogImagePosition ? { objectPosition: entry.ogImagePosition } : undefined
                    }
                    unoptimized={entry.ogImage.endsWith('.gif')}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground/30">
                    {entry.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <time dateTime={entry.date} className="text-sm text-muted-foreground">
                  {entry.dateFormatted}
                </time>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-foreground/80 line-clamp-2">
                  {entry.title}
                </h2>
                {entry.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.description}</p>
                )}
                {entry.authorName && (
                  <div className="mt-auto flex items-center gap-2.5 pt-4">
                    {entry.authorAvatar ? (
                      <Image
                        src={entry.authorAvatar}
                        alt=""
                        width={32}
                        height={32}
                        className="size-8 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-300 ease-out group-hover:scale-105 dark:outline-white/10"
                      />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {entry.authorName.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {entry.authorName}
                      </p>
                      {entry.authorSubtitle && (
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.authorSubtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
