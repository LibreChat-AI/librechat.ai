import { notFound } from 'next/navigation'
import Link from 'next/link'
import { mdxComponents } from '@/lib/mdx-components'
import { changelog } from '@/lib/source'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data'
import { ogImageUrl } from '@/lib/og'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

function getSlug(path: string): string {
  return path.replace(/\.mdx?$/, '')
}

function findEntry(slug: string) {
  return changelog.find((entry) => getSlug(entry.info.path) === slug)
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
      <JsonLd
        data={[
          articleSchema({
            type: 'Article',
            headline: entry.title,
            description: entry.description,
            url: `/changelog/${params.slug}`,
            image: entry.ogImage ?? ogImageUrl({ title: entry.title, type: 'changelog' }),
            datePublished: new Date(date).toISOString(),
          }),
          breadcrumbSchema([
            { name: 'Changelog', url: '/changelog' },
            { name: entry.title, url: `/changelog/${params.slug}` },
          ]),
        ]}
      />
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
          {entry.version && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              v{entry.version}
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
    slug: getSlug(entry.info.path),
  }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const entry = findEntry(params.slug)
  if (!entry) notFound()

  const ogImage = entry.ogImage ?? ogImageUrl({ title: entry.title, type: 'changelog' })

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/changelog/${params.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: 'article',
      url: `/changelog/${params.slug}`,
      images: [ogImage],
    },
  }
}
