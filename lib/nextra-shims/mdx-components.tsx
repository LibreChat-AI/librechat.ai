/**
 * MDX components provider for the Nextra compatibility layer.
 * This module is used as the `providerImportSource` for @mdx-js/loader
 * to automatically provide components that Nextra used to inject
 * via theme.config.tsx's `components` property.
 */
import React from 'react'
import type { ReactNode, ComponentType } from 'react'

interface ChildrenProps {
  children?: ReactNode
  [key: string]: any
}

function Callout({ children, type = 'info', ...props }: ChildrenProps & { type?: string }) {
  return (
    <div data-callout={type} className="callout" {...props}>
      {children}
    </div>
  )
}

function Steps({ children }: ChildrenProps) {
  return <div className="steps">{children}</div>
}

function Tab({ children }: ChildrenProps) {
  return <div>{children}</div>
}

function TabsComponent({ children }: ChildrenProps) {
  return <div>{children}</div>
}

/** Nextra's Tabs component uses compound pattern: `<Tabs.Tab>` */
const Tabs = Object.assign(TabsComponent, { Tab })

function Card({
  children,
  title,
  href,
  ...props
}: ChildrenProps & { title?: string; href?: string }) {
  const content = (
    <div className="card" {...props}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
  if (href) return <a href={href}>{content}</a>
  return content
}

function CardsComponent({ children }: ChildrenProps) {
  return <div className="cards">{children}</div>
}

/** Nextra's Cards component uses compound pattern: `<Cards.Card>` */
const Cards = Object.assign(CardsComponent, { Card })

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
  return <div className="file-tree">{children}</div>
}

/** Nextra's FileTree uses compound pattern: `<FileTree.File>`, `<FileTree.Folder>` */
const FileTree = Object.assign(FileTreeBase, {
  File: FileComponent,
  Folder: FolderComponent,
})

function OptionTable({ options, ...props }: { options: any[]; [key: string]: any }) {
  if (!options || !Array.isArray(options)) return null
  return (
    <table {...props}>
      <thead>
        <tr>
          <th>Option</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {options.map((opt: any, i: number) => (
          <tr key={i}>
            <td>{opt[0]}</td>
            <td>{opt[1]}</td>
            <td>{opt[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Button({ children, ...props }: ChildrenProps) {
  return <button {...props}>{children}</button>
}

function Carousel({ children }: ChildrenProps) {
  return <div className="carousel">{children}</div>
}

function Frame({ children }: ChildrenProps) {
  return <div className="frame">{children}</div>
}

const components: Record<string, ComponentType<any>> = {
  Callout,
  Steps,
  Tabs,
  Tab,
  Cards,
  Card,
  FileTree,
  OptionTable,
  Button,
  Carousel,
  Frame,
}

export function useMDXComponents(existing: Record<string, ComponentType<any>> = {}) {
  return { ...components, ...existing }
}

export function MDXProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
