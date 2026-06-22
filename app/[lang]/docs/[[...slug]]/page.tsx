import { docsSource } from '@/lib/source'
import { mdxComponents } from '@/lib/mdx-components'
import { DocsHub } from '@/components/DocsHub'
import { QuickStartHub } from '@/components/QuickStartHub'
import { FeaturesHub } from '@/components/FeaturesHub'
import { LocalInstallHub } from '@/components/LocalInstallHub'
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page'
import { notFound, redirect } from 'next/navigation'
import { LLMCopyButton, ViewOptions } from '@/components/page-actions'
import { Feedback } from '@/components/Feedback'
import { JsonLd } from '@/components/JsonLd'
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data'
import { ogImageUrl } from '@/lib/og'
import { MachineTranslatedBanner } from '@/components/MachineTranslatedBanner'
import { i18n, localizedDocsHref } from '@/lib/i18n'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ lang: string; slug?: string[] }>
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const page = docsSource.getPage(params.slug, params.lang)
  if (!page) notFound()

  const slugPath = (params.slug ?? []).join('/')
  const englishHref = slugPath ? `/docs/${slugPath}` : '/docs'

  // generateStaticParams omits non-default locales without a translated file, but
  // dynamicParams defaults to true, and the Fumadocs sidebar still emits
  // /<locale>/docs/* links for untranslated slugs (its node url uses the locale
  // even when the file resolves to the English fallback). Redirect such URLs to the
  // English page: no duplicate English content at a localized URL, and the sidebar
  // links resolve instead of 404ing. A real translation (path ends .<locale>.mdx)
  // renders normally.
  if (params.lang !== i18n.defaultLanguage && !page.file.path.endsWith(`.${params.lang}.mdx`)) {
    redirect(englishHref)
  }

  const MDX = page.data.body

  // The hub components render localized chrome but are invoked from MDX without
  // props. Bind the current locale to them per request so they pick up the right
  // dictionary on /<locale>/docs pages.
  const components = {
    ...mdxComponents,
    DocsHub: () => <DocsHub lang={params.lang} />,
    QuickStartHub: () => <QuickStartHub lang={params.lang} />,
    FeaturesHub: () => <FeaturesHub lang={params.lang} />,
    LocalInstallHub: () => <LocalInstallHub lang={params.lang} />,
  }

  // Fumadocs 14.7.7 falls back to the English page for a non-default locale that
  // has no foo.<locale>.mdx yet, so getPage alone can't tell a real translation
  // from a fallback. A real translation's file path ends in `.<locale>.mdx`; a
  // fallback ends in plain `.mdx`. Gate the banner (and the hreflang alternates
  // below) on that so untranslated English fallbacks aren't treated as translated.
  const isTranslated =
    params.lang !== i18n.defaultLanguage && page.file.path.endsWith(`.${params.lang}.mdx`)

  // On localized pages page.file.path is the generated locale file (foo.de.mdx).
  // Point all GitHub links at the English source instead: the locale file is
  // regenerated from the source doc plus content/.i18n-cache on every run and is
  // excluded from the workflow trigger, so edits made directly to it are silently
  // overwritten. Fixing the source is the durable way to improve a translation.
  const localeSuffix = new RegExp(
    `\\.(${i18n.languages.filter((l) => l !== i18n.defaultLanguage).join('|')})\\.mdx$`,
  )
  const sourcePath = page.file.path.replace(localeSuffix, '.mdx')
  const githubHref = `https://github.com/LibreChat-AI/librechat.ai/blob/main/content/docs/${sourcePath}`

  const lastModified =
    page.data.lastModified instanceof Date
      ? page.data.lastModified.toISOString()
      : (page.data.lastModified as string | undefined)

  return (
    <DocsPage
      toc={page.data.toc}
      // single: false makes the clerk TOC track every heading currently in the
      // viewport (the thumb spans the visible range and all in-view items
      // highlight), instead of the default single-active-heading behavior.
      tableOfContent={{ style: 'clerk', single: false }}
      breadcrumb={{
        enabled: true,
        includeRoot: { url: localizedDocsHref('/docs', params.lang) },
        includePage: true,
      }}
      lastUpdate={page.data.lastModified}
      editOnGithub={{
        owner: 'LibreChat-AI',
        repo: 'librechat.ai',
        sha: 'main',
        path: `content/docs/${sourcePath}`,
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
        {/*
          Raw Markdown is only served for the English /docs/*.md route (see the
          next.config rewrite + proxy passthrough); a localized /<locale>/docs/*.md
          URL would 404. Point these at the English source so Copy Markdown / Open
          in LibreChat work on translated pages too. For English pages englishHref
          equals page.url, so this is unchanged there.
        */}
        <LLMCopyButton markdownUrl={`${englishHref}.md`} lang={params.lang} />
        <ViewOptions markdownUrl={`${englishHref}.md`} githubUrl={githubHref} lang={params.lang} />
      </div>
      <DocsBody>
        {isTranslated && (
          <MachineTranslatedBanner
            locale={params.lang}
            englishHref={englishHref}
            githubHref={githubHref}
          />
        )}
        <MDX components={components} />
      </DocsBody>
      <Feedback lang={params.lang} />
    </DocsPage>
  )
}

export async function generateStaticParams() {
  // Fumadocs emits one param set per page for EVERY language even when no
  // localized file exists (getPage falls back to English). Materializing those
  // would publish hundreds of duplicate-English pages at /<locale>/docs/* and
  // list them in the sitemap. Keep the default language plus only locales that
  // have a real translated file on disk (same discriminator as the hreflang gate).
  return docsSource.generateParams().filter((p) => {
    if (p.lang === i18n.defaultLanguage) return true
    return docsSource.getPage(p.slug, p.lang)?.file.path.endsWith(`.${p.lang}.mdx`) ?? false
  })
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const page = docsSource.getPage(params.slug, params.lang)
  if (!page) notFound()
  // Match Page(): a non-default locale resolving to an English fallback redirects
  // to the English page, so don't emit metadata for a URL that won't render here.
  if (params.lang !== i18n.defaultLanguage && !page.file.path.endsWith(`.${params.lang}.mdx`)) {
    const slugPath = (params.slug ?? []).join('/')
    redirect(slugPath ? `/docs/${slugPath}` : '/docs')
  }

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      // Only advertise an hreflang alternate for locales that actually have a
      // translated file. getPage falls back to the English page for a missing
      // locale, so check the resolved file path ends in `.<locale>.mdx` instead
      // of just truthiness, to avoid pointing crawlers at English-fallback
      // alternates for skipped / not-yet-translated pages.
      languages: Object.fromEntries(
        i18n.languages
          .filter((locale) => {
            if (locale === i18n.defaultLanguage) return true
            const localePage = docsSource.getPage(params.slug, locale)
            return localePage?.file.path.endsWith(`.${locale}.mdx`) ?? false
          })
          .map((locale) => {
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
