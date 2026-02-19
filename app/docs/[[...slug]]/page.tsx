import { docsSource } from '@/lib/source'
import { mdxComponents } from '@/lib/mdx-components'
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { LLMCopyButton, ViewOptions } from '@/components/page-actions'
import { Feedback } from '@/components/Feedback'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const page = docsSource.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{ style: 'clerk' }}
      lastUpdate={page.data.lastModified}
      editOnGithub={{
        owner: 'LibreChat-AI',
        repo: 'librechat.ai',
        sha: 'main',
        path: `content/docs/${page.file.path}`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions markdownUrl={`${page.url}.mdx`} />
      </div>
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
      <Feedback />
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return docsSource.generateParams()
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const page = docsSource.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      images: ['/images/socialcards/default-docs-image.png'],
    },
  }
}
