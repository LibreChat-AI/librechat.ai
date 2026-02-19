import { notFound } from 'next/navigation'
import Link from 'next/link'
import { mdxComponents } from '@/lib/mdx-components'
import { changelog } from '@/lib/source'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

function getSlug(path: string): string {
  return path.replace(/\.mdx?$/, '')
}

function findEntry(slug: string) {
  return changelog.find((entry) => getSlug(entry._file.path) === slug)
}

export default async function ChangelogDetailPage(props: PageProps) {
  const params = await props.params
  const entry = findEntry(params.slug)
  if (!entry) notFound()

  const MDX = entry.body
  const date =
    typeof entry.date === 'string' ? entry.date : new Date(entry.date).toISOString().split('T')[0]

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-8">
        <Link
          href="/changelog"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to changelog
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {entry.title}
        </h1>
        {entry.description && (
          <p className="mt-4 text-lg text-muted-foreground">{entry.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={date}>
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {(entry as any).version && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              v{(entry as any).version}
            </span>
          )}
        </div>
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDX components={mdxComponents} />
      </div>
    </article>
  )
}

export function generateStaticParams(): { slug: string }[] {
  return changelog.map((entry) => ({
    slug: getSlug(entry._file.path),
  }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const entry = findEntry(params.slug)
  if (!entry) notFound()

  const ogImage = (entry as any).ogImage ?? '/images/socialcards/default-changelog-image.png'

  return {
    title: entry.title,
    description: entry.description,
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: 'article',
      images: [ogImage],
    },
  }
}
