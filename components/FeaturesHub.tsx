import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Terminal,
  Cable,
  Code,
  Globe,
  Search,
  FileText,
  Brain,
  ScanText,
  ImageIcon,
  Upload,
  GitFork,
  Download,
  Share2,
  Clock,
  Link2,
  RefreshCw,
  Shield,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  href: string
  tag?: string
}

const hero: Feature = {
  icon: Cable,
  title: 'Model Context Protocol',
  description:
    'Connect AI models to any external tool or service through MCP — the open standard for AI tool integration. LibreChat is an official MCP client.',
  href: '/docs/features/mcp',
  tag: 'Official MCP Client',
}

const highlights: Feature[] = [
  {
    icon: Bot,
    title: 'Agents',
    description:
      'Build custom AI assistants with tools, file handling, code execution, and API actions — no coding required.',
    href: '/docs/features/agents',
  },
  {
    icon: Terminal,
    title: 'Code Interpreter',
    description:
      'Execute Python, JavaScript, Go, Rust, and more — securely sandboxed with zero setup.',
    href: '/docs/features/code_interpreter',
  },
  {
    icon: Code,
    title: 'Artifacts',
    description:
      'Generate React components, HTML pages, and Mermaid diagrams directly inside chat.',
    href: '/docs/features/artifacts',
  },
  {
    icon: Brain,
    title: 'Memory',
    description:
      'Persistent context across conversations so your AI remembers preferences and history.',
    href: '/docs/features/memory',
  },
  {
    icon: Globe,
    title: 'Web Search',
    description: 'Give any model live internet access with built-in search and reranking.',
    href: '/docs/features/web_search',
  },
  {
    icon: Shield,
    title: 'Authentication',
    description: 'Enterprise-ready SSO with OAuth2, SAML, LDAP, and two-factor authentication.',
    href: '/docs/features/authentication',
  },
]

type Category = {
  title: string
  id: string
  layout: 'grid' | 'list'
  items: Feature[]
}

const categories: Category[] = [
  {
    title: 'Search & Knowledge',
    id: 'search-knowledge',
    layout: 'grid',
    items: [
      {
        icon: Globe,
        title: 'Web Search',
        description: 'Live internet access with built-in search and reranking',
        href: '/docs/features/web_search',
      },
      {
        icon: Search,
        title: 'Search',
        description: 'Find messages and conversations with Meilisearch',
        href: '/docs/features/search',
      },
      {
        icon: FileText,
        title: 'RAG API',
        description: 'Chat with files using retrieval-augmented generation',
        href: '/docs/features/rag_api',
      },
      {
        icon: Brain,
        title: 'Memory',
        description: 'Persistent context across conversations',
        href: '/docs/features/memory',
      },
      {
        icon: ScanText,
        title: 'OCR',
        description: 'Extract text from images and documents',
        href: '/docs/features/ocr',
      },
    ],
  },
  {
    title: 'Media',
    id: 'media',
    layout: 'grid',
    items: [
      {
        icon: ImageIcon,
        title: 'Image Generation',
        description: 'Create images with GPT-Image-1, DALL-E, Stable Diffusion, and Flux',
        href: '/docs/features/image_gen',
      },
      {
        icon: Upload,
        title: 'Upload as Text',
        description: 'Upload and process files as text input',
        href: '/docs/features/upload_as_text',
      },
    ],
  },
  {
    title: 'Chat',
    id: 'chat',
    layout: 'list',
    items: [
      {
        icon: GitFork,
        title: 'Fork',
        description: 'Split conversations into multiple threads',
        href: '/docs/features/fork',
      },
      {
        icon: Download,
        title: 'Import Conversations',
        description: 'Import chats from ChatGPT and other platforms',
        href: '/docs/features/import_convos',
      },
      {
        icon: Share2,
        title: 'Shareable Links',
        description: 'Share conversations via public links',
        href: '/docs/features/shareable_links',
      },
      {
        icon: Clock,
        title: 'Temporary Chat',
        description: "Private conversations that aren't saved to history",
        href: '/docs/features/temporary_chat',
      },
      {
        icon: Link2,
        title: 'URL Query Parameters',
        description: 'Configure chats dynamically via URL',
        href: '/docs/features/url_query',
      },
      {
        icon: RefreshCw,
        title: 'Resumable Streams',
        description: 'Auto-reconnect and resume interrupted responses',
        href: '/docs/features/resumable_streams',
      },
    ],
  },
  {
    title: 'Security',
    id: 'security',
    layout: 'list',
    items: [
      {
        icon: Shield,
        title: 'Authentication',
        description: 'Multi-user auth with OAuth2, SAML, LDAP, and more',
        href: '/docs/features/authentication',
      },
      {
        icon: KeyRound,
        title: 'Password Reset',
        description: 'Email-based password recovery',
        href: '/docs/features/password_reset',
      },
      {
        icon: ShieldCheck,
        title: 'Moderation System',
        description: 'Content moderation and safety controls',
        href: '/docs/features/mod_system',
      },
    ],
  },
]

function SectionHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
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

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon
  return (
    <Link
      href={feature.href}
      className="group flex flex-col rounded-xl border border-fd-border bg-fd-card p-5 transition-all duration-200 hover:border-fd-foreground/20 hover:shadow-lg hover:shadow-fd-foreground/[0.03]"
    >
      <div className="mb-3 inline-flex w-fit rounded-lg border border-fd-border bg-fd-background p-2 transition-colors group-hover:border-fd-foreground/20">
        <Icon
          className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
          aria-hidden="true"
        />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-fd-foreground">{feature.title}</h3>
      <p className="mb-3 flex-1 text-xs leading-relaxed text-fd-muted-foreground">
        {feature.description}
      </p>
      <span
        className="inline-flex items-center gap-1 text-xs font-medium text-fd-muted-foreground transition-all group-hover:gap-1.5 group-hover:text-fd-foreground"
        aria-hidden="true"
      >
        Learn more
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function ListItem({ item, last }: { item: Feature; last: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-fd-accent${last ? '' : ' border-b border-fd-border'}`}
    >
      <div className="shrink-0 rounded-md bg-fd-accent p-1.5 transition-colors group-hover:bg-fd-background">
        <Icon
          className="size-3.5 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
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
}

export function FeaturesHub() {
  const HeroIcon = hero.icon

  return (
    <nav className="not-prose space-y-10" aria-label="Features navigation">
      {/* Hero feature — MCP */}
      <section aria-labelledby="hero-heading">
        <SectionHeading id="hero-heading">Featured</SectionHeading>
        <Link
          href={hero.href}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-fd-foreground/15 bg-fd-card transition-all duration-200 hover:border-fd-foreground/25 hover:shadow-lg hover:shadow-fd-foreground/[0.04] sm:flex-row"
        >
          {/* Icon area */}
          <div className="flex items-center justify-center border-b border-fd-border bg-fd-accent/50 p-8 sm:w-32 sm:border-b-0 sm:border-r">
            <HeroIcon
              className="size-10 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
              aria-hidden="true"
            />
          </div>
          {/* Content */}
          <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-fd-foreground">{hero.title}</h3>
              {hero.tag && (
                <span className="rounded-full bg-fd-primary px-2.5 py-0.5 text-[10px] font-medium text-fd-primary-foreground">
                  {hero.tag}
                </span>
              )}
            </div>
            <p className="mb-3 text-sm leading-relaxed text-fd-muted-foreground">
              {hero.description}
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-foreground transition-colors group-hover:text-fd-foreground/80"
              aria-hidden="true"
            >
              Read the docs
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </section>

      {/* Highlights — 6 top features in a 3x2 grid */}
      <section aria-labelledby="highlights-heading">
        <SectionHeading id="highlights-heading">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3" aria-hidden="true" />
            Core Features
          </span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      {/* Category sections — mixed layouts */}
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`${category.id}-heading`}>
          <SectionHeading id={`${category.id}-heading`}>{category.title}</SectionHeading>

          {category.layout === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <FeatureCard key={item.title} feature={item} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-fd-border">
              {category.items.map((item, i) => (
                <ListItem key={item.title} item={item} last={i === category.items.length - 1} />
              ))}
            </div>
          )}
        </section>
      ))}
    </nav>
  )
}
