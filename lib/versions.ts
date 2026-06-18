/**
 * Docs version registry for the sidebar version switcher.
 *
 * The first entry marked `current` is the live documentation. To publish an
 * archived version, snapshot the docs into a separate content source + route
 * (e.g. content/docs-v0.7 served at /docs/v0.7) and add an entry here pointing
 * at its base URL; the switcher renders every entry automatically.
 */
export const CURRENT_VERSION = 'v0.8.x'

export interface DocsVersion {
  id: string
  /** Label shown in the switcher. */
  label: string
  /**
   * Canonical (default-locale) base URL of this version's docs, e.g. /docs.
   * The switcher prepends the active locale at render time; do not hard-code a
   * locale prefix here.
   */
  url: string
  /** Marks the live/default version. */
  current?: boolean
}

export const versions: DocsVersion[] = [
  { id: 'current', label: `${CURRENT_VERSION} (latest)`, url: '/docs', current: true },
  // Archived snapshots go here, newest first, e.g.:
  // { id: 'v0_7', label: 'v0.7.x', url: '/docs/v0.7' },
]
