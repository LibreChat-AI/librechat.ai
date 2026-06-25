import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AuthorSocialLinks } from '@/components/authors/AuthorSocialLinks'
import { authors } from '@/lib/authors'
import { getAuthorAccent } from '@/lib/author-profile'
import { cn } from '@/lib/utils'
import { ogImageUrl } from '@/lib/og'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authors',
  description: 'Meet the people writing, maintaining, and shaping LibreChat.',
  openGraph: {
    title: 'Authors | LibreChat',
    description: 'Meet the people writing, maintaining, and shaping LibreChat.',
    images: [ogImageUrl({ title: 'Authors' })],
  },
}

export default function AuthorsPage() {
  const featuredAuthors = authors.slice(0, 5)

  return (
    <main id="main-content" tabIndex={-1} className="overflow-hidden bg-background">
      <section className="relative isolate border-b border-border/70 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,hsl(var(--background))_0%,hsl(var(--muted))_50%,hsl(var(--background))_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <header
            className="author-hero-piece max-w-3xl"
            style={{ '--author-index': 0 } as CSSProperties}
          >
            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              People building the docs, product, and community around LibreChat.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              Meet the maintainers and contributors behind the guides, releases, UI details, and
              project notes that help LibreChat stay open, practical, and useful.
            </p>
          </header>

          <aside
            className="author-feature-card author-hero-piece rounded-[40px] bg-card/75 p-6 backdrop-blur-xl"
            style={{ '--author-index': 1 } as CSSProperties}
            aria-label="Featured author portraits"
          >
            <p className="text-sm font-medium text-muted-foreground">Featured contributors</p>
            <ul className="mt-5 space-y-3">
              {featuredAuthors.map((author, index) => {
                return (
                  <li
                    key={author.id}
                    className="author-feature-item flex items-center gap-3 rounded-[24px] px-2 py-1.5"
                    style={{ '--author-index': index } as CSSProperties}
                  >
                    <Image
                      src={author.avatar}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover shadow-[0_12px_26px_-18px_rgb(0_0_0/0.65)]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {author.name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{author.subtitle}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </aside>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8" aria-label="Authors list">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 max-w-3xl">
            <h2 className="text-balance text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Author roster
            </h2>
          </header>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {authors.map((author, index) => {
              const accent = getAuthorAccent(author)

              return (
                <article
                  key={author.id}
                  style={{ '--author-index': index } as CSSProperties}
                  className="author-card author-stagger group relative min-h-[330px] cursor-pointer overflow-hidden rounded-[36px] bg-card p-6"
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      'author-card__wash pointer-events-none absolute inset-0 bg-gradient-to-br',
                      accent.wash,
                    )}
                  />
                  <Link
                    href={`/authors/${author.id}`}
                    className="absolute inset-0 z-10 rounded-[36px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    aria-label={`Open ${author.name}'s author profile`}
                  />

                  <div className="pointer-events-none relative z-20 flex min-h-full flex-col">
                    <div className="flex items-start gap-4">
                      <Image
                        src={author.avatar}
                        alt={`${author.name}'s profile picture`}
                        width={88}
                        height={88}
                        className="author-card__avatar size-20 shrink-0 rounded-[28px] object-cover shadow-[0_18px_34px_-26px_rgb(0_0_0/0.72)]"
                      />
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1',
                            accent.badge,
                          )}
                        >
                          {author.subtitle}
                        </span>
                        <h3 className="author-card__title mt-3 text-2xl font-semibold leading-tight text-foreground">
                          {author.name}
                        </h3>
                      </div>
                    </div>

                    <p className="author-card__body mt-5 line-clamp-4 text-pretty text-sm leading-6 text-muted-foreground">
                      {author.bio}
                    </p>

                    <div className="mt-auto pt-6">
                      <AuthorSocialLinks
                        socials={author.socials}
                        authorName={author.name}
                        className="author-card__socials pointer-events-auto relative z-30"
                      />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
