import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import { mdxComponents } from '@/lib/mdx-components'
import { blog } from '@/lib/source'
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

function findPost(slug: string) {
  return blog.find((post) => getSlug(post.info.path) === slug)
}

export default async function BlogPostPage(props: PageProps) {
  const params = await props.params
  const post = findPost(params.slug)
  if (!post) notFound()

  const MDX = post.body
  const date =
    typeof post.date === 'string' ? post.date : new Date(post.date).toISOString().split('T')[0]

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={[
          articleSchema({
            type: 'BlogPosting',
            headline: post.title,
            description: post.description,
            url: `/blog/${params.slug}`,
            image:
              post.ogMetaImage ?? post.ogImage ?? ogImageUrl({ title: post.title, type: 'blog' }),
            datePublished: new Date(date).toISOString(),
            authorName: post.author,
          }),
          breadcrumbSchema([
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${params.slug}` },
          ]),
        ]}
      />
      <header className="mb-8">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; Back to blog
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={date}>
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {post.author && <span>by {post.author}</span>}
        </div>
        {post.ogImage && (
          <Image
            src={post.ogImage}
            alt={post.title}
            width={1200}
            height={630}
            className="mt-6 border rounded-2xl"
            unoptimized={post.ogImage.endsWith('.gif')}
          />
        )}
      </header>

      {post.toc && post.toc.length > 0 && (
        <div className="mb-8">
          <InlineTOC items={post.toc} />
        </div>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDX components={mdxComponents} />
      </div>
    </article>
  )
}

export function generateStaticParams(): { slug: string }[] {
  return blog.map((post) => ({
    slug: getSlug(post.info.path),
  }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const post = findPost(params.slug)
  if (!post) notFound()

  const ogImage =
    post.ogMetaImage ?? post.ogImage ?? ogImageUrl({ title: post.title, type: 'blog' })
  const publishedTime =
    typeof post.date === 'string' ? post.date : new Date(post.date).toISOString()

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `/blog/${params.slug}`,
      publishedTime,
      authors: post.author ? [post.author] : undefined,
      images: [ogImage],
    },
  }
}
