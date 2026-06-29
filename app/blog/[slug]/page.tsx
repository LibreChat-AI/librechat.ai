import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import { mdxComponents } from '@/lib/mdx-components'
import { blog } from '@/lib/source'
import { getAuthorById } from '@/lib/authors'
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
  const author = post.author ? getAuthorById(post.author) : undefined
  const authorName = author?.name ?? post.author
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
            authorName,
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
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <time
            dateTime={date}
            className="inline-flex min-h-10 items-center rounded-full bg-muted/70 px-3.5 text-sm font-medium text-muted-foreground"
          >
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {author ? (
            <Link
              href={`/authors/${author.id}`}
              className="group/author inline-flex min-h-12 items-center gap-3 rounded-full bg-card/85 py-1.5 pl-1.5 pr-4 text-muted-foreground shadow-[0_0_0_1px_hsl(var(--border)/0.9),0_14px_34px_-28px_rgb(0_0_0/0.55)] backdrop-blur-xl transition-[transform,box-shadow,background-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-card hover:text-foreground hover:shadow-[0_0_0_1px_hsl(var(--border)),0_22px_48px_-30px_rgb(0_0_0/0.7)] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Image
                src={author.avatar}
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 transition-transform duration-300 ease-out group-hover/author:scale-105 dark:outline-white/10"
              />
              <span className="leading-tight">
                <span className="block text-[11px] font-medium uppercase text-muted-foreground">
                  Written by
                </span>
                <span className="block font-semibold text-foreground">{author.name}</span>
              </span>
            </Link>
          ) : (
            authorName && (
              <span className="inline-flex min-h-10 items-center rounded-full bg-muted/70 px-3.5 text-sm font-medium text-muted-foreground">
                Written by {authorName}
              </span>
            )
          )}
        </div>
        {post.ogImage && (
          <Image
            src={post.ogImage}
            alt={post.title}
            width={post.ogImageWidth ?? 1200}
            height={post.ogImageHeight ?? 630}
            className="mt-6 h-auto w-full rounded-2xl border"
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

  const author = post.author ? getAuthorById(post.author) : undefined
  const authorName = author?.name ?? post.author
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
      authors: authorName ? [authorName] : undefined,
      images: [ogImage],
    },
  }
}
