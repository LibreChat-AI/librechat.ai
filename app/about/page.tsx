import Link from 'next/link'
import {
  Github,
  Star,
  ArrowRight,
  Unlock,
  Layers,
  Globe2,
  ShieldCheck,
  Puzzle,
  Scale,
  Heart,
  Users,
  Mail,
  Linkedin,
  Youtube,
} from 'lucide-react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import Discord from '@/components/icons/discord'
import X from '@/components/icons/x'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About LibreChat',
  description:
    'LibreChat is a free, open-source AI platform that brings together all your AI conversations in one unified, customizable interface.',
}

async function getGitHubData(): Promise<{
  stars: number
  forks: number
  contributors: number
}> {
  try {
    const [repoRes, contribRes] = await Promise.all([
      fetch('https://api.github.com/repos/danny-avila/LibreChat', {
        next: { revalidate: 3600 },
      }),
      fetch(
        'https://api.github.com/repos/danny-avila/LibreChat/contributors?per_page=1&anon=true',
        {
          next: { revalidate: 3600 },
        },
      ),
    ])

    const repoData = repoRes.ok ? await repoRes.json() : {}
    const stars = repoData.stargazers_count ?? 0
    const forks = repoData.forks_count ?? 0

    // GitHub returns total count in Link header for paginated responses
    let contributors = 0
    if (contribRes.ok) {
      const linkHeader = contribRes.headers.get('link')
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>;\s*rel="last"/)
        contributors = match ? parseInt(match[1], 10) : 0
      }
    }

    return { stars, forks, contributors }
  } catch {
    return { stars: 0, forks: 0, contributors: 0 }
  }
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return num.toString()
}

/* ---------------------------------------------------------------------------
 * Hero
 * --------------------------------------------------------------------------- */

function HeroSection() {
  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          About LibreChat
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Every AI, for Everyone
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          LibreChat is a free, open-source AI platform that brings together the best language models
          from every major provider into one unified, customizable interface. No vendor lock-in, no
          subscriptions, full control.
        </p>
        <nav
          className="mt-10 flex items-center justify-center gap-4"
          aria-label="About page actions"
        >
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
          <Link
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Github className="size-4" aria-hidden="true" />
            View on GitHub
          </Link>
        </nav>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Stats Bar
 * --------------------------------------------------------------------------- */

function StatsSection({
  stars,
  forks,
  contributors,
}: {
  stars: number
  forks: number
  contributors: number
}) {
  const stats = [
    { label: 'GitHub Stars', value: stars, icon: Star },
    { label: 'Forks', value: forks, icon: Github },
    { label: 'Contributors', value: contributors, icon: Users },
  ]

  return (
    <section className="border-y border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        {stats
          .filter((s) => s.value > 0)
          .map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {formatNumber(stat.value)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          })}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Values / Why LibreChat
 * --------------------------------------------------------------------------- */

const values = [
  {
    icon: Unlock,
    title: 'Open Source & Free',
    description:
      'MIT licensed. No subscriptions, no restrictions. Use, modify, and distribute freely.',
  },
  {
    icon: Layers,
    title: 'Multi-Provider',
    description:
      'OpenAI, Anthropic, Google, Azure, AWS Bedrock, and dozens more — all in one place.',
  },
  {
    icon: Puzzle,
    title: 'Extensible',
    description:
      'MCP support, custom endpoints, plugins, and agents. Tailor it to your exact workflow.',
  },
  {
    icon: Globe2,
    title: 'Multilingual',
    description: 'Interface available in 30+ languages with community-driven translations.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Ready',
    description:
      'SSO with OAuth, SAML, LDAP, two-factor auth, rate limiting, and moderation tools.',
  },
  {
    icon: Scale,
    title: 'Self-Hosted',
    description:
      'Deploy on your own infrastructure. Your data stays yours — full privacy and compliance.',
  },
]

function ValuesSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why LibreChat
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for developers, teams, and enterprises who need control
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <article key={value.title} className="rounded-xl border border-border bg-card p-6">
                <Icon className="mb-4 size-6 text-muted-foreground" aria-hidden="true" />
                <h3 className="mb-2 text-base font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Mission
 * --------------------------------------------------------------------------- */

function MissionSection() {
  return (
    <section className="border-y border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Mission
          </h2>
        </header>
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            AI is transforming how we work, create, and communicate. But access to powerful AI tools
            shouldn&apos;t require vendor lock-in, opaque pricing, or surrendering your data.
          </p>
          <p>
            LibreChat exists to democratize AI. We believe everyone should have a unified,
            customizable interface that works with any model provider — one they can self-host,
            audit, and extend without limits.
          </p>
          <p>
            What started as a single developer&apos;s project has grown into a community of hundreds
            of contributors and thousands of organizations worldwide. From startups to Fortune 500
            companies, universities to government agencies — LibreChat is the open-source foundation
            they build on.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Contributors
 * --------------------------------------------------------------------------- */

function ContributorsSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Heart className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built by the Community
          </h2>
        </div>
        <p className="mb-12 text-lg text-muted-foreground">
          LibreChat exists thanks to every person who contributes code, documentation, translations,
          and ideas
        </p>
        <Link
          href="https://github.com/danny-avila/LibreChat/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-opacity hover:opacity-80"
          aria-label="View all LibreChat contributors on GitHub"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://contrib.rocks/image?repo=danny-avila/LibreChat&columns=16&max=160"
            alt="LibreChat contributors"
            className="mx-auto rounded-xl"
            loading="lazy"
            width={800}
            height={200}
          />
        </Link>
        <div className="mt-10">
          <Link
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Github className="size-4" aria-hidden="true" />
            Contribute on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Community / Contact
 * --------------------------------------------------------------------------- */

const communityLinks = [
  {
    icon: Github,
    title: 'GitHub Discussions',
    description: 'Ask questions, share ideas, report bugs',
    href: 'https://github.com/danny-avila/LibreChat/discussions',
  },
  {
    icon: Discord,
    title: 'Discord',
    description: 'Chat with the community in real-time',
    href: 'https://discord.librechat.ai',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'contact@librechat.ai',
    href: 'mailto:contact@librechat.ai',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn',
    description: 'Follow for updates and news',
    href: 'https://linkedin.librechat.ai',
  },
  {
    icon: X,
    title: 'X (Twitter)',
    description: '@LibreChatAI',
    href: 'https://x.com/LibreChatAI',
  },
  {
    icon: Youtube,
    title: 'YouTube',
    description: 'Tutorials and demos',
    href: 'https://www.youtube.com/@LibreChat',
  },
]

function CommunitySection() {
  return (
    <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8" id="contact">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join the community or reach out directly
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {communityLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.title}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
              >
                <div className="shrink-0 rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-background">
                  <Icon
                    className="size-5 text-muted-foreground transition-colors group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{link.title}</span>
                  <span className="text-xs text-muted-foreground">{link.description}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * License
 * --------------------------------------------------------------------------- */

function LicenseSection() {
  return (
    <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm text-muted-foreground">
          LibreChat is released under the{' '}
          <Link
            href="https://github.com/danny-avila/LibreChat/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            MIT License
          </Link>
          . Free to use, modify, and distribute.
        </p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Sponsor CTA
 * --------------------------------------------------------------------------- */

function SponsorSection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Support the Project
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          LibreChat is maintained by a dedicated team and community of volunteers. Sponsorships help
          keep the project sustainable.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="https://github.com/sponsors/danny-avila"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Heart className="size-4" aria-hidden="true" />
            Become a Sponsor
          </Link>
          <Link
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Star className="size-4" aria-hidden="true" />
            Star on GitHub
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Page
 * --------------------------------------------------------------------------- */

export default async function AboutPage() {
  const { stars, forks, contributors } = await getGitHubData()

  return (
    <HomeLayout {...baseOptions}>
      <main className="min-h-screen">
        <HeroSection />
        <StatsSection stars={stars} forks={forks} contributors={contributors} />
        <ValuesSection />
        <MissionSection />
        <ContributorsSection />
        <SponsorSection />
        <CommunitySection />
        <LicenseSection />
      </main>
      <div className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FooterMenu />
        </div>
      </div>
    </HomeLayout>
  )
}
