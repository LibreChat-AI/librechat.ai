import Link from 'next/link'
import {
  Rocket,
  Server,
  Cloud,
  Settings,
  Sparkles,
  BookOpen,
  Code,
  FileText,
  Map,
  MessageSquare,
  ChevronRight,
  Terminal,
} from 'lucide-react'
import { localizedDocsHref } from '@/lib/i18n'
import { getUI, type UIStrings } from '@/lib/ui-i18n'

type ItemKey = keyof UIStrings['docsHub']['items']
type SectionKey = keyof UIStrings['docsHub']['sections']

const paths: { id: SectionKey; items: { icon: typeof Rocket; key: ItemKey; href: string }[] }[] = [
  {
    id: 'deploy',
    items: [
      { icon: Rocket, key: 'quickStart', href: '/docs/quick_start' },
      { icon: Server, key: 'local', href: '/docs/local' },
      { icon: Cloud, key: 'remote', href: '/docs/remote' },
    ],
  },
  {
    id: 'configure',
    items: [
      { icon: Settings, key: 'configuration', href: '/docs/configuration' },
      { icon: Terminal, key: 'customEndpoints', href: '/docs/quick_start/custom_endpoints' },
    ],
  },
  {
    id: 'use',
    items: [
      { icon: Sparkles, key: 'features', href: '/docs/features' },
      { icon: BookOpen, key: 'userGuides', href: '/docs/user_guides' },
    ],
  },
  {
    id: 'contribute',
    items: [{ icon: Code, key: 'development', href: '/docs/development' }],
  },
]

type ResourceKey = keyof UIStrings['resources']

const resources: { icon: typeof FileText; key: ResourceKey; href: string }[] = [
  { icon: FileText, key: 'changelog', href: '/changelog' },
  { icon: Map, key: 'roadmap', href: '/blog/2026-02-18_2026_roadmap' },
  { icon: MessageSquare, key: 'discord', href: 'https://discord.librechat.ai' },
]

function SectionHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2
        id={id}
        className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground"
      >
        {children}
      </h2>
      <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
    </div>
  )
}

export function DocsHub({ lang }: { lang?: string }) {
  const ui = getUI(lang)
  const t = ui.docsHub
  return (
    <nav className="not-prose space-y-10" aria-label="Documentation navigation">
      {/* Intent-based path groups */}
      {paths.map((path) => (
        <section key={path.id} aria-labelledby={`${path.id}-heading`}>
          <SectionHeading id={`${path.id}-heading`}>{t.sections[path.id]}</SectionHeading>
          <div className="overflow-hidden rounded-xl border border-fd-border">
            {path.items.map((item, i) => {
              const Icon = item.icon
              const text = t.items[item.key]
              return (
                <Link
                  key={item.key}
                  href={localizedDocsHref(item.href, lang)}
                  className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fd-accent${i < path.items.length - 1 ? ' border-b border-fd-border' : ''}`}
                >
                  <div className="shrink-0 rounded-md bg-fd-accent p-2 transition-colors group-hover:bg-fd-background">
                    <Icon
                      className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-fd-foreground">{text.title}</span>
                    <p className="text-xs text-fd-muted-foreground">{text.description}</p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-fd-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-fd-foreground"
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {/* Resources */}
      <section aria-labelledby="resources-heading">
        <SectionHeading id="resources-heading">{ui.common.resources}</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {resources.map((item) => {
            const Icon = item.icon
            const text = ui.resources[item.key]
            const isExternal = item.href.startsWith('http')
            return (
              <Link
                key={item.key}
                href={localizedDocsHref(item.href, lang)}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-center gap-3 rounded-lg border border-fd-border px-4 py-3 transition-all hover:border-fd-foreground/20 hover:bg-fd-accent"
              >
                <Icon
                  className="size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-fd-foreground">{text.title}</span>
                  <span className="ml-2 text-xs text-fd-muted-foreground">{text.description}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </nav>
  )
}
