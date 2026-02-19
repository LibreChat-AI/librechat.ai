/**
 * Nextra compatibility shim for `nextra/components`.
 * Provides minimal component stubs so existing pages/ components
 * can resolve their imports during the migration to Fumadocs.
 *
 * Nextra's components use compound patterns (e.g., Cards.Card, Tabs.Tab,
 * FileTree.File) which are replicated here using Object.assign.
 */
import React from 'react'
import type { ReactNode } from 'react'

interface ChildrenProps {
  children?: ReactNode
  [key: string]: any
}

export function Steps({ children }: ChildrenProps) {
  return <div className="nextra-steps">{children}</div>
}

function TabComponent({ children }: ChildrenProps) {
  return <div>{children}</div>
}

function TabsBase({ children }: ChildrenProps) {
  return <div>{children}</div>
}

export const Tabs = Object.assign(TabsBase, { Tab: TabComponent })

function CardComponent({
  children,
  title,
  href,
  icon,
  ...props
}: ChildrenProps & { title?: string; href?: string; icon?: ReactNode }) {
  const content = (
    <div
      className="nextra-card flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:h-6 [&>svg]:w-6">{icon}</span>}
      {title && <h3 className="m-0 text-base font-medium">{title}</h3>}
      {children}
    </div>
  )
  if (href)
    return (
      <a
        href={href}
        className="no-underline"
        {...(props.target ? { target: props.target, rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    )
  return content
}

function CardsBase({ children }: ChildrenProps) {
  return <div className="nextra-cards mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}

export const Cards = Object.assign(CardsBase, { Card: CardComponent })

function FileComponent({
  children,
  name,
  ...props
}: ChildrenProps & { name?: string; active?: boolean }) {
  return (
    <div className="file" {...props}>
      {name && <span>{name}</span>}
      {children}
    </div>
  )
}

function FolderComponent({
  children,
  name,
  ...props
}: ChildrenProps & { name?: string; defaultOpen?: boolean }) {
  return (
    <div className="folder" {...props}>
      {name && <span>{name}/</span>}
      {children}
    </div>
  )
}

function FileTreeBase({ children }: ChildrenProps) {
  return <div>{children}</div>
}

export const FileTree = Object.assign(FileTreeBase, {
  File: FileComponent,
  Folder: FolderComponent,
})

export function Button({ children, ...props }: ChildrenProps) {
  return <button {...props}>{children}</button>
}
