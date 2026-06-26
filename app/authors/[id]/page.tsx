import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AuthorSocialLinks } from '@/components/authors/AuthorSocialLinks'
import { authors, getAuthorById } from '@/lib/authors'
import { getAuthorAccent } from '@/lib/author-profile'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

interface AuthorPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return authors.map((author) => ({
    id: author.id,
  }))
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { id } = await params
  const author = getAuthorById(id)

  if (!author) {
    return { title: 'Author Not Found' }
  }

  return {
    title: author.name,
    description: author.bio,
    openGraph: {
      title: `${author.name} | LibreChat`,
      description: author.bio,
      images: [author.avatar],
    },
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params
  const author = getAuthorById(id)

  if (!author) {
    notFound()
  }

  const accent = getAuthorAccent(author)

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative isolate min-h-dvh overflow-hidden bg-background"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,hsl(var(--background))_0%,hsl(var(--muted))_52%,hsl(var(--background))_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-50 [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb">
            <Link
              href="/authors"
              className="author-social-link author-hero-piece inline-flex min-h-11 items-center gap-2 rounded-full bg-background/80 px-4 py-2.5 text-sm font-medium text-muted-foreground backdrop-blur-xl hover:bg-muted hover:text-foreground active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              style={{ '--author-index': 0 } as CSSProperties}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All authors
            </Link>
          </nav>

          <article className="grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:py-16">
            <div
              className="author-detail-visual author-hero-piece relative mx-auto w-full max-w-sm lg:mx-0"
              style={{ '--author-index': 1 } as CSSProperties}
            >
              <div
                aria-hidden="true"
                className={cn(
                  'author-detail-glow absolute inset-0 translate-x-4 translate-y-4 rounded-[48px] bg-gradient-to-br opacity-80',
                  accent.wash,
                )}
              />
              <Image
                src={author.avatar}
                alt={`${author.name}'s profile picture`}
                width={480}
                height={480}
                priority
                className={cn(
                  'author-detail-image relative aspect-square w-full rounded-[42px] object-cover outline outline-1 -outline-offset-1 outline-black/10 ring-4 dark:outline-white/10',
                  accent.imageRing,
                )}
              />
            </div>

            <div className="author-hero-piece" style={{ '--author-index': 2 } as CSSProperties}>
              <span
                className={cn(
                  'inline-flex rounded-full px-3.5 py-1.5 text-sm font-medium ring-1',
                  accent.badge,
                )}
              >
                {author.subtitle}
              </span>
              <h1 className="mt-5 text-balance text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                {author.name}
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
                {author.bio}
              </p>

              {author.socials.length > 0 && (
                <section aria-label="Social links" className="mt-8">
                  <h2 className="sr-only">Social links</h2>
                  <AuthorSocialLinks socials={author.socials} authorName={author.name} showLabels />
                </section>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
