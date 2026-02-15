/**
 * Nextra compatibility shim for `nextra-theme-docs`.
 * Provides stub implementations so existing pages/ components
 * can resolve their imports during the migration to Fumadocs.
 */
import React from 'react'
import type { ReactNode } from 'react'

interface ChildrenProps {
  children?: ReactNode
  [key: string]: any
}

export type DocsThemeConfig = Record<string, any>

export function useConfig(): any {
  return {
    title: '',
    frontMatter: {},
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ThemeSwitch(props: any) {
  return null
}

export function Link({ children, href, ...props }: ChildrenProps & { href?: string }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  )
}
