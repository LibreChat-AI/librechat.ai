import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  Terminal,
  Cable,
  Code,
  Puzzle,
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
} from 'lucide-react'

type Feature = {
  icon: LucideIcon
  title: string
  description: string
  href: string
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
    icon: Cable,
    title: 'Model Context Protocol',
    description:
      'Connect AI models to any tool or service through MCP, the universal standard for AI tool integration.',
    href: '/docs/features/mcp',
  },
  {
    icon: Terminal,
    title: 'Code Interpreter',
    description:
      'Execute code in Python, JavaScript, Go, Rust, and more — securely sandboxed with zero setup.',
    href: '/docs/features/code_interpreter',
  },
]

type Category = {
  title: string
  id: string
  items: Feature[]
}

const categories: Category[] = [
  {
    title: 'AI & Agents',
    id: 'ai-agents',
    items: [
      {
        icon: Cable,
        title: 'MCP',
        description: 'Universal AI tool integration via Model Context Protocol',
        href: '/docs/features/mcp',
      },
      {
        icon: Bot,
        title: 'Agents',
        description: 'Custom AI assistants with tools and actions',
        href: '/docs/features/agents',
      },
      {
        icon: Terminal,
        title: 'Code Interpreter',
        description: 'Secure code execution in 8+ languages',
        href: '/docs/features/code_interpreter',
      },
      {
        icon: Code,
        title: 'Artifacts',
        description: 'Generate React, HTML, and Mermaid diagrams in chat',
        href: '/docs/features/artifacts',
      },
      {
        icon: Puzzle,
        title: 'Plugins',
        description: 'Extend functionality with plugin integrations',
        href: '/docs/features/plugins',
      },
    ],
  },
  {
    title: 'Search & Knowledge',
    id: 'search-knowledge',
    items: [
      {
        icon: Globe,
        title: 'Web Search',
        description: 'Search the web to enhance conversations',
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
    items: [
      {
        icon: Shield,
        title: 'Authentication',
        description: 'Multi-user auth with OAuth2, LDAP, and more',
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

export function FeaturesHub() {
  return (
    <nav className="not-prose space-y-10" aria-label="Features navigation">
      {/* Highlights - 3 prominent feature cards */}
      <section aria-labelledby="highlights-heading">
        <SectionHeading>
          <span id="highlights-heading">Highlights</span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative flex flex-col rounded-xl border border-fd-border bg-fd-card p-5 transition-all duration-200 hover:border-fd-foreground/20 hover:shadow-lg hover:shadow-fd-foreground/[0.03]"
              >
                <div className="mb-3 inline-flex rounded-lg border border-fd-border bg-fd-background p-2 transition-colors group-hover:border-fd-foreground/20">
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
          })}
        </div>
      </section>

      {/* Category sections */}
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`${category.id}-heading`}>
          <SectionHeading>
            <span id={`${category.id}-heading`}>{category.title}</span>
          </SectionHeading>
          <div className="overflow-hidden rounded-xl border border-fd-border">
            {category.items.map((item, i) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-fd-accent${i < category.items.length - 1 ? ' border-b border-fd-border' : ''}`}
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
            })}
          </div>
        </section>
      ))}
    </nav>
  )
}
