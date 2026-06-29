import type { ComponentType } from 'react'
import type { TableOfContents } from 'fumadocs-core/toc'
// Import the SERVER collections entry: `.source/index` uses the bundler-injected
// `_runtime` (only resolvable in client/page bundles), so server code — the
// loader, search route, llms text — must use `.source/server`, which builds on
// fumadocs-mdx's real `server` runtime export. Matches fumadocs' own examples.
import { docs, blog as blogRaw, changelog as changelogRaw } from '@/.source/server'
import { loader } from 'fumadocs-core/source'
import { resolveIcon } from '@/lib/icons'
import { i18n } from '@/lib/i18n'

/** The compiled MDX body component each collection entry exposes. */
type MDXBody = ComponentType<{ components?: Record<string, unknown> }>

export const docsSource = loader({
  source: docs.toFumadocsSource(),
  baseUrl: '/docs',
  i18n,
  icon: resolveIcon,
})

/**
 * fumadocs-mdx 15 injects the collection runtime (`_runtime`) through the
 * createMDX bundler integration, so the generated `.source` is only typed during
 * a real build — a standalone `tsc` sees `blog`/`changelog` as `any`. Re-export
 * them with their frontmatter shape (mirrors the zod schemas in source.config.ts)
 * so the blog/changelog pages keep type safety. `.info.path` is the file path on
 * each entry (was `._file.path` before the upgrade).
 */
interface BlogEntry {
  info: { path: string }
  body: MDXBody
  toc?: TableOfContents
  title: string
  description?: string
  date: string | Date
  author?: string
  ogImage?: string
  ogMetaImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
  ogImagePosition?: string
  category?: 'release' | 'feature' | 'guide' | 'announcement'
  featured?: boolean
  tags?: string[]
}

interface ChangelogDoc {
  info: { path: string }
  body: MDXBody
  toc?: TableOfContents
  title: string
  description?: string
  date: string | Date
  version?: string
  ogImage?: string
}

export const blog = blogRaw as unknown as BlogEntry[]
export const changelog = changelogRaw as unknown as ChangelogDoc[]
