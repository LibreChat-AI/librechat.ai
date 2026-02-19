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

const paths = [
  {
    id: 'deploy',
    title: 'Deploy',
    items: [
      {
        icon: Rocket,
        title: 'Quick Start',
        description: 'Docker setup in 5 minutes',
        href: '/docs/quick_start',
      },
      {
        icon: Server,
        title: 'Local Installation',
        description: 'Docker, npm, and Helm Chart',
        href: '/docs/local',
      },
      {
        icon: Cloud,
        title: 'Remote Hosting',
        description: 'DigitalOcean, Railway, and more',
        href: '/docs/remote',
      },
    ],
  },
  {
    id: 'configure',
    title: 'Configure',
    items: [
      {
        icon: Settings,
        title: 'Configuration',
        description: 'Environment variables, YAML, and auth',
        href: '/docs/configuration',
      },
      {
        icon: Terminal,
        title: 'Custom Endpoints',
        description: 'Connect Ollama, Deepseek, Groq, and more',
        href: '/docs/quick_start/custom_endpoints',
      },
    ],
  },
  {
    id: 'use',
    title: 'Use',
    items: [
      {
        icon: Sparkles,
        title: 'Features',
        description: 'MCP, Agents, Code Interpreter, Artifacts',
        href: '/docs/features',
      },
      {
        icon: BookOpen,
        title: 'User Guides',
        description: 'Presets, tips, and best practices',
        href: '/docs/user_guides',
      },
    ],
  },
  {
    id: 'contribute',
    title: 'Contribute',
    items: [
      {
        icon: Code,
        title: 'Development',
        description: 'Contributing, architecture, and debugging',
        href: '/docs/development',
      },
    ],
  },
]

const resources = [
  {
    icon: FileText,
    title: 'Changelog',
    description: 'Latest releases',
    href: '/changelog',
  },
  {
    icon: Map,
    title: '2026 Roadmap',
    description: "What's planned",
    href: '/blog/2026-02-18_2026_roadmap',
  },
  {
    icon: MessageSquare,
    title: 'Discord',
    description: 'Get help',
    href: 'https://discord.librechat.ai',
  },
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

export function DocsHub() {
  return (
    <nav className="not-prose space-y-10" aria-label="Documentation navigation">
      {/* Intent-based path groups */}
      {paths.map((path) => (
        <section key={path.id} aria-labelledby={`${path.id}-heading`}>
          <SectionHeading id={`${path.id}-heading`}>{path.title}</SectionHeading>
          <div className="overflow-hidden rounded-xl border border-fd-border">
            {path.items.map((item, i) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fd-accent${i < path.items.length - 1 ? ' border-b border-fd-border' : ''}`}
                >
                  <div className="shrink-0 rounded-md bg-fd-accent p-2 transition-colors group-hover:bg-fd-background">
                    <Icon
                      className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-fd-foreground">{item.title}</span>
                    <p className="text-xs text-fd-muted-foreground">{item.description}</p>
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
        <SectionHeading id="resources-heading">Resources</SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {resources.map((item) => {
            const Icon = item.icon
            const isExternal = item.href.startsWith('http')
            return (
              <Link
                key={item.title}
                href={item.href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-center gap-3 rounded-lg border border-fd-border px-4 py-3 transition-all hover:border-fd-foreground/20 hover:bg-fd-accent"
              >
                <Icon
                  className="size-4 shrink-0 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-fd-foreground">{item.title}</span>
                  <span className="ml-2 text-xs text-fd-muted-foreground">{item.description}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </nav>
  )
}
