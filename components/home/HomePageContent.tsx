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
  type LucideIcon,
} from 'lucide-react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'

import DemoImageDark from '@/components/home/img/demo_dark.png'
import DemoImageLight from '@/components/home/img/demo_light.png'
import DemoImageMobileDark from '@/components/home/img/demo_mobile_dark.png'
import DemoImageMobileLight from '@/components/home/img/demo_mobile_light.png'
import FooterMenu from '@/components/FooterMenu'
import { JsonLd } from '@/components/JsonLd'
import { HomeI18nProvider } from '@/components/HomeI18nProvider'
import { organizationSchema, websiteSchema, softwareApplicationSchema } from '@/lib/structured-data'
import { localizedDocsHref } from '@/lib/i18n'
import { getUI, fmt, type UIStrings } from '@/lib/ui-i18n'

type HomeStrings = UIStrings['home']

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
  {
    name: 'Stripe',
    logoLight: '/images/logos/Stripe wordmark - Slate.svg',
    logoDark: '/images/logos/Stripe wordmark - White.svg',
    isSvg: true,
    height: 'h-10',
    imgHeight: 40,
  },
]

/* ---------------------------------------------------------------------------
 * Features data (icons + hrefs; localized title/description from the dictionary)
 * --------------------------------------------------------------------------- */

type FeatureKey = keyof HomeStrings['features']

const features: { icon: LucideIcon; key: FeatureKey; href: string }[] = [
  { icon: Bot, key: 'agents', href: '/docs/features/agents' },
  { icon: Terminal, key: 'codeInterpreter', href: '/docs/features/code_interpreter' },
  { icon: Settings2, key: 'models', href: '/docs/configuration/pre_configured_ai' },
  { icon: Code, key: 'artifacts', href: '/docs/features/artifacts' },
  { icon: Search, key: 'search', href: '/docs/configuration/meilisearch' },
  { icon: Plug, key: 'mcp', href: '/docs/features/mcp' },
  { icon: Brain, key: 'memory', href: '/docs/features/memory' },
  { icon: Globe, key: 'webSearch', href: '/docs/features/web_search' },
  { icon: ShieldCheck, key: 'authentication', href: '/docs/configuration/authentication' },
]

/* ---------------------------------------------------------------------------
 * Hero Section
 * --------------------------------------------------------------------------- */

function HeroSection({ stars, t, lang }: { stars: number; t: HomeStrings; lang: string }) {
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
            aria-label={fmt(t.starAria, { count: formatNumber(stars) })}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 text-foreground">
              <Github className="size-4" aria-hidden="true" />
              {t.starOnGitHub}
            </span>
            <span className="inline-flex items-center gap-1.5 border-l border-border px-3 py-2 text-muted-foreground">
              <Star className="size-3.5" aria-hidden="true" />
              {formatNumber(stars)}
            </span>
          </Link>
        )}

        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {t.heroTitleTop}
          <br />
          {t.heroTitleBottom}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          {t.heroSubtitle}
        </p>

        {/* CTAs */}
        <nav
          className="mt-10 flex items-center justify-center gap-4"
          aria-label={t.primaryActionsAria}
        >
          <Link
            href={localizedDocsHref('/docs', lang)}
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label={t.getStartedAria}
          >
            {t.getStarted}
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
          <Link
            href="https://chat.librechat.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label={t.tryDemoAria}
          >
            {t.tryDemo}
          </Link>
        </nav>
      </div>

      {/* Demo screenshot */}
      <div className="mx-auto mt-16 max-w-5xl">
        {/* Desktop */}
        <div className="hidden md:block">
          <Image
            src={DemoImageLight}
            alt={t.desktopLightAlt}
            className="block rounded-xl border border-border shadow-sm dark:hidden"
            priority
            sizes="(max-width: 1280px) 90vw, 1120px"
            placeholder="blur"
          />
          <Image
            src={DemoImageDark}
            alt={t.desktopDarkAlt}
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
            alt={t.mobileLightAlt}
            className="mx-auto block w-full max-w-sm rounded-xl border border-border shadow-sm dark:hidden"
            priority
            sizes="(max-width: 640px) 90vw, 384px"
            placeholder="blur"
          />
          <Image
            src={DemoImageMobileDark}
            alt={t.mobileDarkAlt}
            className="mx-auto hidden w-full max-w-sm rounded-xl border border-border shadow-sm dark:block"
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

function TrustedBySection({ t }: { t: HomeStrings }) {
  return (
    <section className="border-y border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {t.trustedBy}
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

function FeaturesSection({ t, lang }: { t: HomeStrings; lang: string }) {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.featuresHeading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t.featuresSubtitle}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            const text = t.features[feature.key]
            return (
              <article key={feature.key}>
                <Link
                  href={localizedDocsHref(feature.href, lang)}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted"
                >
                  <Icon
                    className="mb-4 size-6 text-muted-foreground transition-colors group-hover:text-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="mb-2 text-base font-semibold text-foreground">{text.title}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{text.description}</p>
                  <span
                    className="mt-4 inline-flex items-center text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    {t.learnMore}
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
  t,
}: {
  stars: number
  pulls: number
  contributors: number
  t: HomeStrings
}) {
  return (
    <section className="border-y border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.communityHeading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t.communitySubtitle}</p>
        </header>

        {/* Stats */}
        <div className="mb-16 grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {stars > 0 ? formatNumber(stars) : '--'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t.githubStars}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {pulls > 0 ? formatNumber(pulls) : '--'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t.dockerPulls}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {contributors > 0 ? formatNumber(contributors) : '--'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t.contributors}</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex items-center justify-center gap-4" aria-label={t.communityLinksAria}>
          <Link
            href="https://github.com/danny-avila/LibreChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label={t.githubAria}
          >
            <Github className="size-4" aria-hidden="true" />
            GitHub
          </Link>
          <Link
            href="https://discord.librechat.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            aria-label={t.discordAria}
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

function CTASection({ t, lang }: { t: HomeStrings; lang: string }) {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t.ctaHeading}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t.ctaSubtitle}</p>
        <div className="mt-10">
          <Link
            href={localizedDocsHref('/docs', lang)}
            className="inline-flex items-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label={t.quickstartAria}
          >
            {t.quickstartGuide}
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Landing page content, shared by the default-language `/` route and the
 * locale-prefixed `/<locale>` routes.
 * --------------------------------------------------------------------------- */

export async function HomePageContent({ lang }: { lang: string }) {
  const [{ stars, contributors }, pulls] = await Promise.all([getGitHubData(), getContainerPulls()])

  const ui = getUI(lang)
  const t = ui.home
  const navLinks = [
    { text: ui.nav.docs, url: localizedDocsHref('/docs', lang), active: 'nested-url' as const },
    { text: ui.nav.blog, url: '/blog' },
    { text: ui.nav.changelog, url: '/changelog' },
  ]

  return (
    <HomeI18nProvider locale={lang}>
      <HomeLayout
        {...baseOptions}
        i18n
        links={navLinks}
        nav={{ ...baseOptions.nav, transparentMode: 'top' }}
      >
        <JsonLd data={[organizationSchema, websiteSchema, softwareApplicationSchema]} />
        <main id="main-content" tabIndex={-1} className="min-h-screen">
          <HeroSection stars={stars} t={t} lang={lang} />
          <TrustedBySection t={t} />
          <FeaturesSection t={t} lang={lang} />
          <CommunitySection stars={stars} pulls={pulls} contributors={contributors} t={t} />
          <CTASection t={t} lang={lang} />
        </main>
        <div className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <FooterMenu lang={lang} />
          </div>
        </div>
      </HomeLayout>
    </HomeI18nProvider>
  )
}
