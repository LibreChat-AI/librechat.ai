import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { authors, getAuthorById } from '@/lib/authors'
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/authors"
          className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground hover:text-fd-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All authors
        </Link>
      </nav>

      <article className="text-center">
        <Image
          src={author.avatar}
          alt={`${author.name}'s profile picture`}
          width={120}
          height={120}
          className="mx-auto rounded-full"
          priority
        />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">{author.name}</h1>
        <p className="mt-2 text-fd-muted-foreground">{author.subtitle}</p>
        <p className="mt-6 text-fd-muted-foreground">{author.bio}</p>

        {author.socials.length > 0 && (
          <section aria-label="Social links" className="mt-8">
            <h2 className="sr-only">Social links</h2>
            <ul className="flex flex-wrap justify-center gap-3">
              {author.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-fd-border px-3 py-1.5 text-sm transition-colors hover:bg-fd-accent"
                  >
                    {social.label}
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  )
}
