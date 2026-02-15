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
  ...props
}: ChildrenProps & { title?: string; href?: string }) {
  const content = (
    <div className="nextra-card" {...props}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
  if (href) return <a href={href}>{content}</a>
  return content
}

function CardsBase({ children }: ChildrenProps) {
  return <div className="nextra-cards">{children}</div>
}

export const Cards = Object.assign(CardsBase, { Card: CardComponent })

function FileComponent({ children, name, ...props }: ChildrenProps & { name?: string }) {
  return (
    <div className="file" {...props}>
      {name && <span>{name}</span>}
      {children}
    </div>
  )
}

function FolderComponent({ children, name, ...props }: ChildrenProps & { name?: string }) {
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
