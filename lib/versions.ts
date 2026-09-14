/**
 * The live docs version.
 *
 * Archived versions are not listed here: they are discovered from the
 * directories under `content/docs-archive` (see lib/docs-archive.ts), so
 * publishing one is a content-only change. This module stays free of
 * server-only imports because the switcher is a client component.
 */
export const CURRENT_VERSION = 'v0.8.x'

export interface DocsVersionOption {
  /** `current` for the live docs, otherwise the archived version id. */
  id: string
  /** Label shown in the switcher. */
  label: string
  /**
   * Canonical (default-locale) base URL of this version's docs, e.g. `/docs`
   * or `/v0.7.x/docs`. The switcher prepends the active locale for the live
   * docs only; archived snapshots are English-only.
   */
  url: string
  /** Marks the live version. */
  current?: boolean
}

export const CURRENT_VERSION_OPTION: DocsVersionOption = {
  id: 'current',
  label: `${CURRENT_VERSION} (latest)`,
  url: '/docs',
  current: true,
}
