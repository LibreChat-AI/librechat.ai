import { docsSource } from '@/lib/source'
import { mdxComponents } from '@/lib/mdx-components'
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { LLMCopyButton, ViewOptions } from '@/components/page-actions'
import { Feedback } from '@/components/Feedback'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data'
import { ogImageUrl } from '@/lib/og'
import { MachineTranslatedBanner } from '@/components/MachineTranslatedBanner'
import { i18n } from '@/lib/i18n'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const page = docsSource.getPage(params.slug, params.lang)
  if (!page) notFound()

  const MDX = page.data.body

  const slugPath = (params.slug ?? []).join('/')
  const englishHref = slugPath ? `/docs/${slugPath}` : '/docs'
  const githubHref = `https://github.com/LibreChat-AI/librechat.ai/blob/main/content/docs/${page.file.path}`

  const lastModified =
    page.data.lastModified instanceof Date
      ? page.data.lastModified.toISOString()
      : (page.data.lastModified as string | undefined)

  return (
    <DocsPage
      toc={page.data.toc}
      tableOfContent={{ style: 'clerk' }}
      breadcrumb={{ enabled: true, includeRoot: { url: '/docs' }, includePage: true }}
      lastUpdate={page.data.lastModified}
      editOnGithub={{
        owner: 'LibreChat-AI',
        repo: 'librechat.ai',
        sha: 'main',
        path: `content/docs/${page.file.path}`,
      }}
    >
      <JsonLd
        data={[
          articleSchema({
            type: 'TechArticle',
            headline: page.data.title,
            description: page.data.description,
            url: page.url,
            image: ogImageUrl({ title: page.data.title, type: 'docs' }),
            dateModified: lastModified,
          }),
          breadcrumbSchema([
            { name: 'Docs', url: '/docs' },
            { name: page.data.title, url: page.url },
          ]),
        ]}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/LibreChat-AI/librechat.ai/blob/main/content/docs/${page.file.path}`}
        />
      </div>
      <DocsBody>
        {params.lang !== i18n.defaultLanguage && (
          <MachineTranslatedBanner
            locale={params.lang}
            englishHref={englishHref}
            githubHref={githubHref}
          />
        )}
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
  const page = docsSource.getPage(params.slug, params.lang)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      languages: Object.fromEntries(
        i18n.languages.map((locale) => {
          const slugPath = (params.slug ?? []).join('/')
          const href =
            locale === i18n.defaultLanguage
              ? slugPath
                ? `/docs/${slugPath}`
                : '/docs'
              : slugPath
                ? `/${locale}/docs/${slugPath}`
                : `/${locale}/docs`
          return [locale, href]
        }),
      ),
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: 'article',
      url: page.url,
      images: [ogImageUrl({ title: page.data.title, type: 'docs' })],
    },
  }
}
