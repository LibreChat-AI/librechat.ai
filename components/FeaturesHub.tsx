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
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { localizedDocsHref } from '@/lib/i18n'
import { getUI, type UIStrings } from '@/lib/ui-i18n'

type ResolvedFeature = {
  icon: LucideIcon
  title: string
  description: string
  href: string
}

// Structural data (icon + href + dictionary key). Localized title/description
// come from the UI dictionary so the hub follows the docs locale.
const hero = { icon: Cable, href: '/docs/features/mcp' }

type HighlightKey = keyof UIStrings['featuresHub']['highlights']

const highlights: { icon: LucideIcon; key: HighlightKey; href: string }[] = [
  { icon: Bot, key: 'agents', href: '/docs/features/agents' },
  { icon: Terminal, key: 'codeInterpreter', href: '/docs/features/code_interpreter' },
  { icon: Code, key: 'artifacts', href: '/docs/features/artifacts' },
  { icon: Brain, key: 'memory', href: '/docs/features/memory' },
  { icon: Globe, key: 'webSearch', href: '/docs/features/web_search' },
  { icon: Shield, key: 'authentication', href: '/docs/features/authentication' },
]

type CategoryKey = keyof UIStrings['featuresHub']['categories']

const categories: {
  key: CategoryKey
  layout: 'grid' | 'list'
  items: { icon: LucideIcon; key: string; href: string }[]
}[] = [
  {
    key: 'searchKnowledge',
    layout: 'grid',
    items: [
      { icon: Globe, key: 'webSearch', href: '/docs/features/web_search' },
      { icon: Search, key: 'search', href: '/docs/features/search' },
      { icon: FileText, key: 'ragApi', href: '/docs/features/rag_api' },
      { icon: Brain, key: 'memory', href: '/docs/features/memory' },
      { icon: ScanText, key: 'ocr', href: '/docs/features/ocr' },
    ],
  },
  {
    key: 'media',
    layout: 'grid',
    items: [
      { icon: ImageIcon, key: 'imageGen', href: '/docs/features/image_gen' },
      { icon: Upload, key: 'uploadAsText', href: '/docs/features/upload_as_text' },
    ],
  },
  {
    key: 'chat',
    layout: 'list',
    items: [
      { icon: GitFork, key: 'fork', href: '/docs/features/fork' },
      { icon: Download, key: 'importConvos', href: '/docs/features/import_convos' },
      { icon: Share2, key: 'shareableLinks', href: '/docs/features/shareable_links' },
      { icon: Clock, key: 'temporaryChat', href: '/docs/features/temporary_chat' },
      { icon: Link2, key: 'urlQuery', href: '/docs/features/url_query' },
      { icon: RefreshCw, key: 'resumableStreams', href: '/docs/features/resumable_streams' },
    ],
  },
  {
    key: 'security',
    layout: 'list',
    items: [
      { icon: Shield, key: 'authentication', href: '/docs/features/authentication' },
      { icon: LayoutDashboard, key: 'adminPanel', href: '/docs/features/admin_panel' },
      { icon: KeyRound, key: 'passwordReset', href: '/docs/features/password_reset' },
      { icon: ShieldCheck, key: 'moderation', href: '/docs/features/mod_system' },
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

function FeatureCard({ feature, learnMore }: { feature: ResolvedFeature; learnMore: string }) {
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
        {learnMore}
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function ListItem({ item, last }: { item: ResolvedFeature; last: boolean }) {
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

export function FeaturesHub({ lang }: { lang?: string }) {
  const ui = getUI(lang)
  const t = ui.featuresHub
  const HeroIcon = hero.icon

  return (
    <nav className="not-prose space-y-10" aria-label={t.ariaLabel}>
      {/* Hero feature — MCP */}
      <section aria-labelledby="hero-heading">
        <SectionHeading id="hero-heading">{t.featuredHeading}</SectionHeading>
        <Link
          href={localizedDocsHref(hero.href, lang)}
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
              <h3 className="text-base font-semibold text-fd-foreground">{t.hero.title}</h3>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-fd-muted-foreground">
              {t.hero.description}
            </p>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-foreground transition-colors group-hover:text-fd-foreground/80"
              aria-hidden="true"
            >
              {ui.common.readDocs}
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
            {t.coreFeaturesHeading}
          </span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((feature) => {
            const text = t.highlights[feature.key]
            return (
              <FeatureCard
                key={feature.key}
                feature={{
                  icon: feature.icon,
                  href: localizedDocsHref(feature.href, lang),
                  ...text,
                }}
                learnMore={ui.common.learnMore}
              />
            )
          })}
        </div>
      </section>

      {/* Category sections — mixed layouts */}
      {categories.map((category) => {
        const cat = t.categories[category.key]
        const itemsText = cat.items as Record<string, { title: string; description: string }>
        return (
          <section key={category.key} aria-labelledby={`${category.key}-heading`}>
            <SectionHeading id={`${category.key}-heading`}>{cat.title}</SectionHeading>

            {category.layout === 'grid' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <FeatureCard
                    key={item.key}
                    feature={{
                      icon: item.icon,
                      href: localizedDocsHref(item.href, lang),
                      ...itemsText[item.key],
                    }}
                    learnMore={ui.common.learnMore}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-fd-border">
                {category.items.map((item, i) => (
                  <ListItem
                    key={item.key}
                    item={{
                      icon: item.icon,
                      href: localizedDocsHref(item.href, lang),
                      ...itemsText[item.key],
                    }}
                    last={i === category.items.length - 1}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </nav>
  )
}
