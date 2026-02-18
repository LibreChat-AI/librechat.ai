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

function RailwayLogo(props: ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M.113 14.575c.042.208.272.404.48.404h3.349a2.97 2.97 0 0 0-.086-.808H.113zM23.887 14.575H20.13a2.97 2.97 0 0 1-.086.808h3.363c.208 0 .438-.196.48-.404a.503.503 0 0 0 0-.404zM21.601 16.391H17.89a2.588 2.588 0 0 1-.74.808h4.959c.193 0 .393-.186.393-.404 0-.218-.2-.404-.393-.404h-.508zM2.907 16.391H2.4c-.193 0-.393.186-.393.404 0 .218.2.404.393.404h4.945a2.588 2.588 0 0 1-.74-.808zM23.52 12.355H17.1a4.96 4.96 0 0 1 .16.808h6.26c.208 0 .438-.2.48-.404a.503.503 0 0 0 0-.404zM6.9 12.355H.48c-.208 0-.438.2-.48.404a.503.503 0 0 0 0 .404h6.26a4.96 4.96 0 0 1 .16-.808h.48zM23.52 10.134h-8.38a5.243 5.243 0 0 1 1.04.808h7.34c.208 0 .438-.2.48-.404a.503.503 0 0 0 0-.404zM7.82 10.134H.48c-.208 0-.438.2-.48.404a.503.503 0 0 0 0 .404h7.34a5.243 5.243 0 0 1 1.04-.808h-.56zM4.36 7.913c-.193 0-.393.186-.393.404 0 .218.2.404.393.404h2.396C7.678 7.949 8.742 7.33 9.9 6.8H4.36zm15.28 0H14.1c1.157.53 2.222 1.149 3.144 1.921h2.396c.193 0 .393-.186.393-.404 0-.218-.2-.404-.393-.404zM16.078 2.285a11.647 11.647 0 0 0-8.157 0A22.696 22.696 0 0 0 12 3.597a22.696 22.696 0 0 0 4.078-1.312zM12 0c-1.2 0-2.367.145-3.488.42C10.04 1.236 11.144 1.78 12 2.2c.856-.42 1.96-.964 3.488-1.78A12.2 12.2 0 0 0 12 0zM12 4.79c-1.464.744-3.3 1.53-5.438 2.01H17.438C15.3 6.32 13.464 5.534 12 4.79zM7.346 18.607H6.69c-.193 0-.393.186-.393.404 0 .218.2.404.393.404h10.634c.193 0 .393-.186.393-.404 0-.218-.2-.404-.393-.404h-.655a2.344 2.344 0 0 1-2.126 1.36h-5.07a2.344 2.344 0 0 1-2.127-1.36zM8.66 21.375c-.193 0-.393.186-.393.404 0 .218.2.404.393.404h6.68c.193 0 .393-.186.393-.404 0-.218-.2-.404-.393-.404zM8.907 23.596c-.193 0-.393.186-.393.404 0 .218.2.404.393.404h6.2c.193 0 .393-.186.393-.404 0-.218-.2-.404-.393-.404z"
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
