import Link from 'next/link'
import {
  Container,
  Plug,
  Server,
  Cloud,
  Settings,
  Sparkles,
  BookOpen,
  Code,
  FileText,
  Map,
  MessageSquare,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

const quickstart = [
  {
    icon: Container,
    title: 'Local Setup',
    description: 'Get LibreChat running on your machine in minutes using Docker.',
    href: '/docs/quick_start/local_setup',
  },
  {
    icon: Plug,
    title: 'Custom Endpoints',
    description: 'Connect to OpenRouter, Ollama, Deepseek, Groq, and other AI providers.',
    href: '/docs/quick_start/custom_endpoints',
  },
]

const categories = [
  {
    icon: Server,
    title: 'Local Installation',
    description: 'Docker, npm, and Helm Chart deployment',
    href: '/docs/local',
  },
  {
    icon: Cloud,
    title: 'Remote Hosting',
    description: 'DigitalOcean, Railway, HuggingFace, and more',
    href: '/docs/remote',
  },
  {
    icon: Settings,
    title: 'Configuration',
    description: 'Environment variables, YAML, auth, and endpoints',
    href: '/docs/configuration',
  },
  {
    icon: Sparkles,
    title: 'Features',
    description: 'MCP, Agents, Code Interpreter, Artifacts, and more',
    href: '/docs/features',
  },
  {
    icon: BookOpen,
    title: 'User Guides',
    description: 'Presets, AI overview, tips, and best practices',
    href: '/docs/user_guides',
  },
  {
    icon: Code,
    title: 'Development',
    description: 'Contributing, architecture, and debugging',
    href: '/docs/development',
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
    title: '2025 Roadmap',
    description: "What's planned",
    href: '/blog/2025-02-20_2025_roadmap',
  },
  {
    icon: MessageSquare,
    title: 'Discord',
    description: 'Get help',
    href: 'https://discord.librechat.ai',
  },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h2 className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground">
        {children}
      </h2>
      <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
    </div>
  )
}

export function DocsHub() {
  return (
    <nav className="not-prose space-y-10" aria-label="Documentation navigation">
      {/* Quick Start - Primary actions, visually prominent */}
      <section aria-labelledby="qs-heading">
        <SectionHeading>
          <span id="qs-heading">Quick Start</span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickstart.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative rounded-xl border border-fd-border bg-fd-card p-6 transition-all duration-200 hover:border-fd-foreground/20 hover:shadow-lg hover:shadow-fd-foreground/[0.03]"
              >
                <div className="mb-4 inline-flex rounded-lg border border-fd-border bg-fd-background p-2.5 transition-colors group-hover:border-fd-foreground/20">
                  <Icon
                    className="size-5 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-fd-foreground">{item.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-fd-muted-foreground">
                  {item.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium text-fd-muted-foreground transition-all group-hover:gap-1.5 group-hover:text-fd-foreground"
                  aria-hidden="true"
                >
                  Get started
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Documentation - Clean navigation list */}
      <section aria-labelledby="docs-heading">
        <SectionHeading>
          <span id="docs-heading">Documentation</span>
        </SectionHeading>
        <div className="overflow-hidden rounded-xl border border-fd-border">
          {categories.map((item, i) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-fd-accent${i < categories.length - 1 ? ' border-b border-fd-border' : ''}`}
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

      {/* Resources - Compact links */}
      <section aria-labelledby="resources-heading">
        <SectionHeading>
          <span id="resources-heading">Resources</span>
        </SectionHeading>
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
