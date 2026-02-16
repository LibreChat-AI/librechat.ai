import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Callout } from 'fumadocs-ui/components/callout'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tabs } from 'fumadocs-ui/components/tabs'
import { File, Folder, Files } from 'fumadocs-ui/components/files'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { OptionTable } from '@/components/table'
import { Frame } from '@/components/Frame'
import { DocsHub } from '@/components/DocsHub'
import { QuickStartHub } from '@/components/QuickStartHub'
import { FeaturesHub } from '@/components/FeaturesHub'
import Carousel from '@/components/carousel/Carousel'
import type { ReactNode } from 'react'

function mapCalloutType(type?: string): 'info' | 'warn' | 'error' {
  switch (type) {
    case 'warning':
    case 'warn':
    case 'important':
    case 'danger':
      return 'warn'
    case 'error':
    case 'bug':
      return 'error'
    default:
      return 'info'
  }
}

function CalloutCompat({
  children,
  type,
  title,
  collapsible,
  ...props
}: {
  children?: ReactNode
  type?: string
  title?: ReactNode
  collapsible?: boolean
  [key: string]: any
}) {
  const mappedType = mapCalloutType(type)

  if (collapsible && title) {
    return (
      <Accordions type="single" collapsible>
        <Accordion title={typeof title === 'string' ? title : 'Details'}>
          <Callout type={mappedType} {...props}>
            {children}
          </Callout>
        </Accordion>
      </Accordions>
    )
  }

  return (
    <Callout type={mappedType} title={title} {...props}>
      {children}
    </Callout>
  )
}

/**
 * Simple Tab/Tabs wrappers that render content directly.
 * The fumadocs-mdx compiler generates tab structures that may be incomplete
 * when the remarkCodeTab plugin isn't available. These wrappers render the
 * content as simple divs to avoid Radix UI context errors.
 */
function TabCompat({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return <div {...props}>{children}</div>
}

function TabsCompat({
  children,
  items,
  ...props
}: {
  children?: ReactNode
  items?: string[]
  [key: string]: any
}) {
  if (items && items.length > 0) {
    // Use real Fumadocs Tabs when items are provided (explicit Tabs usage)
    return (
      <Tabs items={items} {...props}>
        {children}
      </Tabs>
    )
  }
  // Fallback: render children directly for auto-generated tab structures
  return <div {...props}>{children}</div>
}
;(TabsCompat as any).Tab = TabCompat

function CardsCompat({
  children,
  num,
  ...props
}: {
  children?: ReactNode
  num?: number
  [key: string]: any
}) {
  const gridClass =
    num === 2
      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
      : num === 4
        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
  return (
    <div className={gridClass} {...props}>
      {children}
    </div>
  )
}

function CardCompat({
  children,
  title,
  href,
  icon,
  arrow,
  image,
  ...props
}: {
  children?: ReactNode
  title?: string
  href?: string
  icon?: ReactNode
  arrow?: boolean
  image?: boolean
  [key: string]: any
}) {
  const content = (
    <div className="flex flex-col gap-2">
      {icon && <div className="text-2xl">{icon}</div>}
      {title && <h3 className="font-semibold text-fd-foreground">{title}</h3>}
      {children && <div className="text-sm text-fd-muted-foreground">{children}</div>}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        className="group block rounded-xl border border-fd-border bg-fd-card p-5 transition-all hover:border-fd-primary/30 hover:bg-fd-accent hover:shadow-sm"
        {...props}
      >
        {content}
        {arrow && (
          <span className="mt-3 inline-block text-sm text-fd-muted-foreground transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        )}
      </a>
    )
  }

  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-5" {...props}>
      {content}
    </div>
  )
}
;(CardsCompat as any).Card = CardCompat

function FileTreeCompat({ children, ...props }: { children?: ReactNode; [key: string]: any }) {
  return <Files {...props}>{children}</Files>
}
;(FileTreeCompat as any).File = File
;(FileTreeCompat as any).Folder = Folder

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ImgCompat({ image, ...props }: { image?: boolean; [key: string]: any }) {
  const src = typeof props.src === 'string' ? props.src : ''
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  if (isExternal) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} loading="lazy" />
  }
  const DefaultImg = defaultMdxComponents.img
  if (DefaultImg) return <DefaultImg {...props} />
  return <img {...props} />
}

export const mdxComponents = {
  ...defaultMdxComponents,
  img: ImgCompat,
  Callout: CalloutCompat,
  Steps,
  Step,
  Tab: TabCompat,
  Tabs: TabsCompat,
  Cards: CardsCompat,
  Card: CardCompat,
  FileTree: FileTreeCompat,
  File,
  Folder,
  Files,
  Accordion,
  Accordions,
  OptionTable,
  Frame,
  Carousel,
  DocsHub,
  QuickStartHub,
  FeaturesHub,
  Button: ({ children, ...props }: { children?: ReactNode; [key: string]: any }) => (
    <button className="rounded-md bg-fd-primary px-4 py-2 text-fd-primary-foreground" {...props}>
      {children}
    </button>
  ),
}
