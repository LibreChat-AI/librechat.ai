import Link from 'next/link'
import { Clock, CheckCircle2, ArrowRight, Plug, FileText, Map, MessageSquare } from 'lucide-react'
import type { ComponentProps } from 'react'

function DockerLogo(props: ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#2496ED"
        d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.186.186 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.186.186 0 0 0-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.186.186 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.186.186 0 0 0-.185-.185H8.1a.186.186 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.186.186 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.186.186 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.186.186 0 0 0 .184-.185V9.006a.186.186 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.186.186 0 0 0 .185-.185V9.006a.186.186 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.185m-2.92 0h2.12a.186.186 0 0 0 .184-.185V9.006a.186.186 0 0 0-.184-.186h-2.12a.186.186 0 0 0-.184.186v1.887c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"
      />
    </svg>
  )
}

function NpmLogo(props: ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#CB3837"
        d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002z"
      />
    </svg>
  )
}

function RailwayLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      className={`text-[#100F13] dark:text-white ${className ?? ''}`}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.756 438.175A520.713 520.713 0 0 0 0 489.735h777.799c-2.716-5.306-6.365-10.09-10.045-14.772-132.97-171.791-204.498-156.896-306.819-161.26-34.114-1.403-57.249-1.967-193.037-1.967-72.677 0-151.688.185-228.628.39-9.96 26.884-19.566 52.942-24.243 74.14h398.571v51.909H4.756ZM783.93 541.696H.399c.82 13.851 2.112 27.517 3.978 40.999h723.39c32.248 0 50.299-18.297 56.162-40.999ZM45.017 724.306S164.941 1018.77 511.46 1024c207.112 0 385.071-123.006 465.907-299.694H45.017Z"
        fill="currentColor"
      />
      <path
        d="M511.454 0C319.953 0 153.311 105.16 65.31 260.612c68.771-.144 202.704-.226 202.704-.226h.031v-.051c158.309 0 164.193.707 195.118 1.998l19.149.706c66.7 2.224 148.683 9.384 213.19 58.19 35.015 26.471 85.571 84.896 115.708 126.52 27.861 38.499 35.876 82.756 16.933 125.158-17.436 38.97-54.952 62.215-100.383 62.215H16.69s4.233 17.944 10.58 37.751h970.632A510.385 510.385 0 0 0 1024 512.218C1024.01 229.355 794.532 0 511.454 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

const methods = [
  {
    icon: DockerLogo,
    title: 'Docker',
    tag: 'Recommended',
    description: 'Everything included — MongoDB, MeiliSearch, and RAG API run automatically.',
    href: '/docs/local/docker',
    time: '~5 min',
    prereqs: ['Docker Desktop'],
    steps: ['Clone the repository', 'Copy .env.example to .env', 'Run docker compose up'],
  },
  {
    icon: NpmLogo,
    title: 'npm',
    description: 'Manual setup with Node.js. Requires separate MongoDB and MeiliSearch instances.',
    href: '/docs/local/npm',
    time: '~20 min',
    prereqs: ['Node.js v20.19+', 'MongoDB instance'],
    steps: [
      'Clone and install dependencies',
      'Configure .env and start MongoDB',
      'Run npm run backend',
    ],
  },
  {
    icon: RailwayLogo,
    title: 'Railway',
    tag: 'One-click',
    description: 'Deploy to the cloud instantly. No local setup, no Docker, no servers to manage.',
    href: '/docs/remote/railway',
    time: '~3 min',
    prereqs: ['Railway account', 'GitHub account'],
    steps: ['Click the deploy button', 'Connect your GitHub', 'Set environment variables'],
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

export function QuickStartHub() {
  return (
    <nav className="not-prose space-y-8" aria-label="Quick start guides">
      {/* Installation methods */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {methods.map((method) => {
          const Icon = method.icon
          return (
            <Link
              key={method.title}
              href={method.href}
              className="group flex flex-col rounded-xl border border-fd-border bg-fd-card transition-all duration-200 hover:border-fd-foreground/20 hover:shadow-lg hover:shadow-fd-foreground/[0.03]"
            >
              {/* Header */}
              <div className="border-b border-fd-border p-5 pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex rounded-lg border border-fd-border bg-fd-background p-2 transition-colors group-hover:border-fd-foreground/20">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    {method.tag && (
                      <span className="rounded-full border border-fd-border px-2 py-0.5 text-[10px] font-medium text-fd-muted-foreground">
                        {method.tag}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-fd-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      {method.time}
                    </span>
                  </div>
                </div>
                <h3 className="mb-1 text-base font-semibold text-fd-foreground">{method.title}</h3>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">
                  {method.description}
                </p>
              </div>

              {/* Steps + prereqs */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <ol className="mb-4 space-y-2" aria-label={`${method.title} steps`}>
                  {method.steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fd-accent text-[10px] font-semibold tabular-nums text-fd-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-5 text-fd-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>

                <div>
                  <ul className="mb-4 space-y-1">
                    {method.prereqs.map((prereq) => (
                      <li
                        key={prereq}
                        className="flex items-center gap-2 text-xs text-fd-muted-foreground"
                      >
                        <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                        {prereq}
                      </li>
                    ))}
                  </ul>

                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-foreground transition-colors group-hover:text-fd-foreground/80"
                    aria-hidden="true"
                  >
                    Get started
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Next step callout */}
      <section aria-labelledby="next-step-heading">
        <div className="flex items-center gap-3 mb-4">
          <h2
            id="next-step-heading"
            className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground"
          >
            After Installation
          </h2>
          <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
        </div>
        <Link
          href="/docs/quick_start/custom_endpoints"
          className="group flex items-center gap-4 rounded-xl border border-fd-border px-5 py-4 transition-colors hover:bg-fd-accent"
        >
          <div className="shrink-0 rounded-md bg-fd-accent p-2 transition-colors group-hover:bg-fd-background">
            <Plug
              className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium text-fd-foreground">Connect AI Providers</span>
            <p className="text-xs text-fd-muted-foreground">
              Add OpenRouter, Ollama, Deepseek, Groq, and other OpenAI-compatible services
            </p>
          </div>
          <ArrowRight
            className="size-4 shrink-0 text-fd-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-fd-foreground"
            aria-hidden="true"
          />
        </Link>
      </section>

      {/* Resources */}
      <section aria-labelledby="resources-heading">
        <div className="flex items-center gap-3 mb-4">
          <h2
            id="resources-heading"
            className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground"
          >
            Resources
          </h2>
          <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
        </div>
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
