import Image from 'next/image'
import Link from 'next/link'
import {
  Bot,
  Terminal,
  Settings2,
  Code,
  Search,
  Plug,
  Brain,
  Globe,
  ShieldCheck,
  ArrowRight,
  Github,
  Star,
  MessageSquare,
} from 'lucide-react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import type { Metadata } from 'next'

import DemoImageDark from '@/components/home/img/demo_dark.png'
import DemoImageLight from '@/components/home/img/demo_light.png'
import DemoImageMobileDark from '@/components/home/img/demo_mobile_dark.png'
import DemoImageMobileLight from '@/components/home/img/demo_mobile_light.png'
import FooterMenu from '@/components/FooterMenu'

export const metadata: Metadata = {
  title: 'LibreChat - The Open-Source AI Platform',
  description:
    'LibreChat brings together all your AI conversations in one unified, customizable interface.',
}

/* ---------------------------------------------------------------------------
 * Data fetching (server-side, cached)
 * --------------------------------------------------------------------------- */

async function getGitHubData(): Promise<{ stars: number; contributors: number }> {
  try {
    const [repoRes, contribRes] = await Promise.all([
      fetch('https://api.github.com/repos/danny-avila/LibreChat', {
        next: { revalidate: 3600 },
      }),
      fetch(
        'https://api.github.com/repos/danny-avila/LibreChat/contributors?per_page=1&anon=true',
        { next: { revalidate: 3600 } },
      ),
    ])

    const repoData = repoRes.ok ? await repoRes.json() : {}
    const stars = repoData.stargazers_count ?? 0

    let contributors = 0
    if (contribRes.ok) {
      const linkHeader = contribRes.headers.get('link')
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/)
        contributors = match ? parseInt(match[1], 10) : 0
      }
    }

    return { stars, contributors }
  } catch {
    return { stars: 0, contributors: 0 }
  }
}

const DOCKER_HUB_REPOS = [
  'librechat/librechat',
  'librechat/librechat-api',
  'librechat/librechat-dev',
  'librechat/librechat-dev-api',
  'librechat/lc-dev',
  'librechat/lc-dev-api',
]

const GHCR_PACKAGES = ['librechat', 'librechat-api', 'librechat-dev', 'librechat-dev-api']

async function getDockerHubPulls(repo: string): Promise<number> {
  try {
    const res = await fetch(`https://hub.docker.com/v2/repositories/${repo}/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return 0
    const data = await res.json()
    return data.pull_count ?? 0
  } catch {
    return 0
  }
}

async function getGhcrDownloads(pkg: string): Promise<number> {
  try {
    const res = await fetch(`https://github.com/danny-avila/LibreChat/pkgs/container/${pkg}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return 0
    const html = await res.text()
    const match = html.match(/Total downloads[\s\S]*?title="(\d+)"/)
    return match ? parseInt(match[1], 10) : 0
  } catch {
    return 0
  }
}

async function getContainerPulls(): Promise<number> {
  const [dockerHubCounts, ghcrCounts] = await Promise.all([
    Promise.all(DOCKER_HUB_REPOS.map(getDockerHubPulls)),
    Promise.all(GHCR_PACKAGES.map(getGhcrDownloads)),
  ])
  return [...dockerHubCounts, ...ghcrCounts].reduce((sum, n) => sum + n, 0)
}

/* ---------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------- */

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  }
  return num.toString()
}

/* ---------------------------------------------------------------------------
 * Company logos data
 * --------------------------------------------------------------------------- */

const companies = [
  {
    name: 'Shopify',
    logoLight: '/images/logos/Shopify_light.svg',
    logoDark: '/images/logos/Shopify_dark.svg',
    isSvg: true,
    height: 'h-12',
    imgHeight: 48,
  },
  {
    name: 'Daimler Truck',
    logoLight: '/images/logos/DaimlerTruck_light.svg',
    logoDark: '/images/logos/DaimlerTruck_dark.svg',
    isSvg: true,
    height: 'h-6',
    imgHeight: 24,
  },
  {
    name: 'Boston University',
    logoLight: '/images/logos/BostonUniversity_light.png',
    logoDark: '/images/logos/BostonUniversity_dark.png',
    isSvg: false,
    height: 'h-12',
    imgHeight: 48,
  },
  {
    name: 'ClickHouse',
    logoLight: '/images/logos/ClickHouse_light.svg',
    logoDark: '/images/logos/ClickHouse_dark.svg',
    isSvg: true,
    height: 'h-14',
    imgHeight: 56,
  },
]

/* ---------------------------------------------------------------------------
 * Features data
 * --------------------------------------------------------------------------- */

const features = [
  {
    icon: Bot,
    title: 'Agents',
    description: 'Advanced agents with file handling, code interpretation, and API actions',
    href: '/docs/features/agents',
  },
  {
    icon: Terminal,
    title: 'Code Interpreter',
    description: 'Execute code in multiple languages securely with zero setup',
    href: '/docs/features/code_interpreter',
  },
  {
    icon: Settings2,
    title: 'Models',
    description: 'AI model selection including Anthropic, AWS, OpenAI, Azure, and more',
    href: '/docs/configuration/pre_configured_ai',
  },
  {
    icon: Code,
    title: 'Artifacts',
    description: 'Create React, HTML code, and Mermaid diagrams in chat',
    href: '/docs/features/artifacts',
  },
  {
    icon: Search,
    title: 'Search',
    description: 'Search for messages, files, and code snippets in an instant',
    href: '/docs/configuration/meilisearch',
  },
  {
    icon: Plug,
    title: 'MCP',
    description: 'Connect to any tool or service with Model Context Protocol support',
    href: '/docs/features/mcp',
  },
  {
    icon: Brain,
    title: 'Memory',
    description: 'Persistent context across conversations so your AI remembers you',
    href: '/docs/features/memory',
  },
  {
    icon: Globe,
    title: 'Web Search',
    description: 'Give any model live internet access with built-in search and reranking',
    href: '/docs/features/web_search',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication',
    description: 'Enterprise-ready SSO with OAuth, SAML, LDAP, and two-factor auth',
    href: '/docs/configuration/authentication',
  },
]

/* ---------------------------------------------------------------------------
 * Hero Section
 * --------------------------------------------------------------------------- */

function HeroSection({ stars }: { stars: number }) {
  return (
    <section className="px-4 pb-24 pt-16 sm:px-6 md:pt-24 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        {/* GitHub stars badge */}
        {stars > 0 && (
          <Link
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-8 inline-flex items-center rounded-full border border-border text-sm transition-colors hover:bg-accent"
            aria-label={`Star LibreChat on GitHub — ${formatNumber(stars)} stars`}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 text-foreground">
              <Github className="size-4" aria-hidden="true" />
              Star on GitHub
            </span>
            <span className="inline-flex items-center gap-1.5 border-l border-border px-3 py-2 text-muted-foreground">
              <Star className="size-3.5" aria-hidden="true" />
              {formatNumber(stars)}
            </span>
          </Link>
        )}

        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          The Open-Source
          <br />
          AI Platform
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          LibreChat brings together all your AI conversations in one unified, customizable interface
        </p>

        {/* CTAs */}
        <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Primary actions">
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Get started with LibreChat documentation"
          >
            Get Started
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
          <Link
            href="https://chat.librechat.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label="Try the LibreChat demo"
          >
            Try Demo
          </Link>
        </nav>
      </div>

      {/* Demo screenshot */}
      <div className="mx-auto mt-16 max-w-5xl">
        {/* Desktop */}
        <div className="hidden md:block">
          <Image
            src={DemoImageLight}
            alt="LibreChat desktop interface in light mode"
            className="block rounded-xl border border-border shadow-sm dark:hidden"
            priority
            sizes="(max-width: 1280px) 90vw, 1120px"
            placeholder="blur"
          />
          <Image
            src={DemoImageDark}
            alt="LibreChat desktop interface in dark mode"
            className="hidden rounded-xl border border-border shadow-sm dark:block"
            priority
            sizes="(max-width: 1280px) 90vw, 1120px"
            placeholder="blur"
          />
        </div>
        {/* Mobile */}
        <div className="block md:hidden">
          <Image
            src={DemoImageMobileLight}
            alt="LibreChat mobile interface in light mode"
            className="mx-auto block max-w-sm rounded-xl border border-border shadow-sm dark:hidden"
            priority
            sizes="(max-width: 640px) 90vw, 384px"
            placeholder="blur"
          />
          <Image
            src={DemoImageMobileDark}
            alt="LibreChat mobile interface in dark mode"
            className="mx-auto hidden max-w-sm rounded-xl border border-border shadow-sm dark:block"
            priority
            sizes="(max-width: 640px) 90vw, 384px"
            placeholder="blur"
          />
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Trusted By Section
 * --------------------------------------------------------------------------- */

function TrustedBySection() {
  return (
    <section className="border-y border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by companies worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {companies.map((company) => (
            <figure key={company.name} className="flex items-center justify-center px-4">
              {/* Light mode logo */}
              <Image
                src={company.logoLight}
                alt={`${company.name} logo`}
                className={`block ${company.height} w-auto object-contain opacity-60 transition-opacity hover:opacity-100 dark:hidden`}
                width={160}
                height={company.imgHeight}
                sizes="160px"
                unoptimized={company.isSvg}
              />
              {/* Dark mode logo */}
              <Image
                src={company.logoDark}
                alt={`${company.name} logo`}
                className={`hidden ${company.height} w-auto object-contain opacity-60 transition-opacity hover:opacity-100 dark:block`}
                width={160}
                height={company.imgHeight}
                sizes="160px"
                unoptimized={company.isSvg}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Features Section
 * --------------------------------------------------------------------------- */

function FeaturesSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A comprehensive platform for AI-powered conversations
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title}>
                <Link
                  href={feature.href}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted"
                >
                  <Icon
                    className="mb-4 size-6 text-muted-foreground transition-colors group-hover:text-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{feature.description}</p>
                  <span
                    className="mt-4 inline-flex items-center text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    Learn more
                    <ArrowRight className="ml-1 size-3.5" />
                  </span>
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Community Section
 * --------------------------------------------------------------------------- */

function CommunitySection({
  stars,
  pulls,
  contributors,
}: {
  stars: number
  pulls: number
  contributors: number
}) {
  return (
    <section className="border-y border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Open source, community driven
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of developers and organizations building with LibreChat
          </p>
        </header>

        {/* Stats */}
        <div className="mb-16 grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {stars > 0 ? formatNumber(stars) : '--'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">GitHub Stars</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {pulls > 0 ? formatNumber(pulls) : '--'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Docker Pulls</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {contributors > 0 ? formatNumber(contributors) : '--'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Contributors</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex items-center justify-center gap-4" aria-label="Community links">
          <Link
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label="LibreChat on GitHub"
          >
            <Github className="size-4" aria-hidden="true" />
            GitHub
          </Link>
          <Link
            href="https://discord.librechat.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label="LibreChat on Discord"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Discord
          </Link>
        </nav>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * CTA Section
 * --------------------------------------------------------------------------- */

function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Start building with LibreChat
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Get up and running in minutes with our quickstart guide
        </p>
        <div className="mt-10">
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Read the quickstart guide"
          >
            Quickstart Guide
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Page Component
 * --------------------------------------------------------------------------- */

export default async function HomePage() {
  const [{ stars, contributors }, pulls] = await Promise.all([getGitHubData(), getContainerPulls()])

  return (
    <HomeLayout {...baseOptions} nav={{ ...baseOptions.nav, transparentMode: 'top' }}>
      <main className="min-h-screen">
        <HeroSection stars={stars} />
        <TrustedBySection />
        <FeaturesSection />
        <CommunitySection stars={stars} pulls={pulls} contributors={contributors} />
        <CTASection />
      </main>
      <div className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FooterMenu />
        </div>
      </div>
    </HomeLayout>
  )
}
