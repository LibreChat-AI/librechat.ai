/**
 * Nextra compatibility shim for `nextra` (main package).
 * Provides stub type exports so existing pages/ components
 * can resolve their imports during the migration to Fumadocs.
 */

export interface Page {
  name: string
  route: string
  children?: Page[]
  meta?: Record<string, any>
  frontMatter?: Record<string, any>
  [key: string]: any
}

export interface MdxFile {
  name: string
  route: string
  frontMatter?: Record<string, any>
  [key: string]: any
}

export type { Page as default }
