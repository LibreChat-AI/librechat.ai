import 'server-only'

import { DocsHub } from '@/components/DocsHub'
import { FeaturesHub } from '@/components/FeaturesHub'
import { Feedback } from '@/components/Feedback'
import { JsonLd } from '@/components/JsonLd'
import { LocalInstallHub } from '@/components/LocalInstallHub'
import { MachineTranslatedBanner } from '@/components/MachineTranslatedBanner'
import { QuickStartHub } from '@/components/QuickStartHub'
import { LLMCopyButton, ViewOptions } from '@/components/page-actions'
import { CredentialsGeneratorMDX } from '@/components/tools/CredentialsGeneratorMDX'
import { YAMLValidatorMDX } from '@/components/tools/YAMLValidatorMDX'
import { i18n, localizedDocsHref } from '@/lib/i18n'
import { mdxComponents } from '@/lib/mdx-components'
import { ogImageUrl } from '@/lib/og'
import { docsSource } from '@/lib/source'
import { articleSchema, breadcrumbSchema } from '@/lib/structured-data'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

export interface DocsRouteParams {
  lang: string
  slug?: string[]
}

function englishDocsHref(slug?: string[]): string {
  const slugPath = (slug ?? []).join('/')
  return slugPath ? `/docs/${slugPath}` : '/docs'
}

function isRealTranslation(lang: string, path: string): boolean {
  return lang !== i18n.defaultLanguage && path.endsWith(`.${lang}.mdx`)
}

export async function renderDocsPage(params: DocsRouteParams) {
  const page = docsSource.getPage(params.slug, params.lang)
  if (!page) notFound()

  const englishHref = englishDocsHref(params.slug)

  // generateLocalizedDocsParams omits locales without a translated file, but
  // dynamicParams defaults to true, and the Fumadocs sidebar still emits
  // /<locale>/docs/* links for untranslated slugs (its node url uses the locale
  // even when the file resolves to the English fallback). Redirect such URLs to the
  // English page: no duplicate English content at a localized URL, and the sidebar
  // links resolve instead of 404ing. A real translation (path ends .<locale>.mdx)
  // renders normally.
  if (params.lang !== i18n.defaultLanguage && !isRealTranslation(params.lang, page.path)) {
    redirect(englishHref)
  }

  const MDX = page.data.body

  // Interactive MDX widgets render localized chrome but are invoked from MDX
  // without props. Bind the current locale to them per request so they pick up
  // the right dictionary on /<locale>/docs pages.
  const components = {
    ...mdxComponents,
    DocsHub: () => <DocsHub lang={params.lang} />,
    QuickStartHub: () => <QuickStartHub lang={params.lang} />,
    FeaturesHub: () => <FeaturesHub lang={params.lang} />,
    LocalInstallHub: () => <LocalInstallHub lang={params.lang} />,
    CredentialsGeneratorMDX: () => <CredentialsGeneratorMDX lang={params.lang} />,
    YAMLValidatorMDX: () => <YAMLValidatorMDX lang={params.lang} />,
  }

  // Fumadocs falls back to the English page for a non-default locale that has
  // no foo.<locale>.mdx yet. Gate the banner (and the hreflang alternates below)
  // on the generated file suffix so English fallbacks aren't treated as translated.
  const isTranslated = isRealTranslation(params.lang, page.path)

  // On localized pages page.path is the generated locale file (foo.de.mdx).
  // Point all GitHub links at the English source instead: the locale file is
  // regenerated from the source doc plus content/.i18n-cache on every run and is
  // excluded from the workflow trigger, so edits made directly to it are silently
  // overwritten. Fixing the source is the durable way to improve a translation.
  const localeSuffix = new RegExp(
    `\\.(${i18n.languages.filter((lang) => lang !== i18n.defaultLanguage).join('|')})\\.mdx$`,
  )
  const sourcePath = page.path.replace(localeSuffix, '.mdx')
  const githubHref = `https://github.com/LibreChat-AI/librechat.ai/blob/main/content/docs/${sourcePath}`

  // `lastModified` is populated only when a git last-modified loader option is
  // enabled (this site doesn't), so it's optional and absent from the strict
  // fumadocs data type — read it defensively.
  const lastModifiedRaw = (page.data as { lastModified?: Date | string }).lastModified
  const lastModified =
    lastModifiedRaw instanceof Date ? lastModifiedRaw.toISOString() : lastModifiedRaw

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
      lastUpdate={lastModifiedRaw}
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
          in LibreChat work on translated pages too.
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

export function generateEnglishDocsParams() {
  return docsSource
    .generateParams()
    .filter((params) => params.lang === i18n.defaultLanguage)
    .map(({ slug }) => ({ slug }))
}

export function generateLocalizedDocsParams() {
  // Fumadocs emits one param set per page for every language even when no
  // localized file exists (getPage falls back to English). Materializing those
  // would publish duplicate-English pages at /<locale>/docs/* and in the sitemap.
  return docsSource.generateParams().filter((params) => {
    if (params.lang === i18n.defaultLanguage) return false
    return (
      docsSource.getPage(params.slug, params.lang)?.path.endsWith(`.${params.lang}.mdx`) ?? false
    )
  })
}

export async function generateDocsMetadata(params: DocsRouteParams): Promise<Metadata> {
  const page = docsSource.getPage(params.slug, params.lang)
  if (!page) notFound()

  // Match renderDocsPage(): a non-default locale resolving to an English
  // fallback redirects to its canonical English page.
  if (params.lang !== i18n.defaultLanguage && !isRealTranslation(params.lang, page.path)) {
    redirect(englishDocsHref(params.slug))
  }

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      // Only advertise an hreflang alternate for locales that actually have a
      // translated file. getPage falls back to English for a missing locale.
      languages: Object.fromEntries(
        i18n.languages
          .filter((locale) => {
            if (locale === i18n.defaultLanguage) return true
            const localePage = docsSource.getPage(params.slug, locale)
            return localePage?.path.endsWith(`.${locale}.mdx`) ?? false
          })
          .map((locale) => {
            const slugPath = (params.slug ?? []).join('/')
            const href =
              locale === i18n.defaultLanguage
                ? englishDocsHref(params.slug)
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
