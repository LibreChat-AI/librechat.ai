import 'server-only'

import { docsArchive } from '@/.source/server'
import { loader, type StaticSource } from 'fumadocs-core/source'
import { resolveIcon } from '@/lib/icons'
import { DOCS_VERSION_ID_PATTERN, compareDocsVersionsDescending } from '@/lib/docs-version-order'
import { CURRENT_VERSION_OPTION, type DocsVersionOption } from '@/lib/versions'
import type { Root } from 'fumadocs-core/page-tree'
import type { TableOfContents } from 'fumadocs-core/toc'
import type { ComponentType } from 'react'

/**
 * Archived docs versions.
 *
 * Every directory directly under `content/docs-archive` is one frozen docs
 * version mirroring the structure of `content/docs` (see
 * content/docs-archive/README.md), served at `/<version>/docs`. The version
 * occupies the same URL slot as a locale prefix — the only slot Next.js leaves
 * free beside the `/docs/[[...slug]]` catch-all, which cannot have a dynamic
 * sibling segment.
 *
 * Archived content is its own fumadocs collection, so the live page tree,
 * search index, llms text, translation workflow and `pnpm sync:config-version`
 * never see it.
 */

/**
 * The generated source is only typed during a real build (fumadocs-mdx injects
 * the collection runtime through the bundler), so name the slice of the loader
 * API the archived routes depend on instead of inferring it — same approach as
 * the blog/changelog re-exports in lib/source.ts.
 */
export interface ArchivedPage {
  url: string
  path: string
  data: {
    title: string
    description?: string
    body: ComponentType<{ components?: Record<string, unknown> }>
    toc?: TableOfContents
  }
}

export interface ArchivedDocsSource {
  pageTree: Root
  getPage: (slug?: string[]) => ArchivedPage | undefined
  generateParams: () => { slug: string[] }[]
}

type ArchiveFile = StaticSource['files'][number]

const archiveFiles: ArchiveFile[] = docsArchive.toFumadocsSource().files

/**
 * Newest first. Files sitting directly in `content/docs-archive` (its README)
 * belong to no version and are ignored; a *directory* that isn't a valid
 * version id is a typo that would publish nothing at all, so it throws.
 */
export const archivedVersions: string[] = (() => {
  const ids = new Set<string>()

  for (const file of archiveFiles) {
    const separator = file.path.indexOf('/')
    if (separator < 0) continue

    const id = file.path.slice(0, separator)
    if (!DOCS_VERSION_ID_PATTERN.test(id)) {
      throw new Error(
        `Invalid archived docs version directory: content/docs-archive/${id} (expected e.g. v0.8.7 or v0.8.8-rc2)`,
      )
    }

    ids.add(id)
  }

  return [...ids].sort(compareDocsVersionsDescending)
})()

export function isArchivedVersion(id: string | undefined): boolean {
  return !!id && archivedVersions.includes(id)
}

const sources = new Map<string, ArchivedDocsSource>()

/** The fumadocs source for one archived version, rooted at `/<version>/docs`. */
export function archivedDocsSource(version: string): ArchivedDocsSource {
  const cached = sources.get(version)
  if (cached) return cached

  const prefix = `${version}/`
  const source = loader({
    source: {
      files: archiveFiles
        .filter((file) => file.path.startsWith(prefix))
        .map((file) => ({ ...file, path: file.path.slice(prefix.length) })),
    },
    baseUrl: `/${version}/docs`,
    icon: resolveIcon,
  }) as unknown as ArchivedDocsSource

  sources.set(version, source)
  return source
}

/**
 * Options for the sidebar version switcher: the live docs first, then every
 * archived version newest-first. Computed on the server and handed to the
 * client switcher as props — archived versions are discovered from content, so
 * publishing one is a content-only change.
 */
export function docsVersionOptions(): DocsVersionOption[] {
  return [
    CURRENT_VERSION_OPTION,
    ...archivedVersions.map((id) => ({ id, label: id, url: `/${id}/docs` })),
  ]
}
