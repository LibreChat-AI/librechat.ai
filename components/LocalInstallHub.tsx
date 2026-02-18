import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  HardDrive,
  Layers,
  Package,
  Server,
  Shield,
} from 'lucide-react'
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

function HelmLogo(props: ComponentProps<'svg'>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#0F1689"
        d="M10.082 2.006a1.2 1.2 0 0 0-.59.196L2.47 6.56a1.213 1.213 0 0 0-.555.87l-.905 8.154c-.04.365.086.73.345.994l5.756 5.87c.259.264.617.4.98.37l8.14-.69c.362-.03.694-.214.907-.502l4.697-6.39c.213-.288.297-.653.23-1.013l-1.478-8.066a1.216 1.216 0 0 0-.616-.834L13.38 2.072a1.2 1.2 0 0 0-.538-.13h-.004a1.14 1.14 0 0 0-.144.008l-.004.001a1.2 1.2 0 0 0-.138.023h-.002l-.004.002-.009.002-.003.001-.022.006-.019.006h-.003l-.004.002-.018.005-.004.002-.003.001-.018.006-.004.002-.003.001-.018.006-.004.002-.003.001-.017.007-.004.002-.003.001-.017.007-.005.002-.002.001-.018.008-.004.002-.002.002-.017.008-.005.002-.002.002-.017.009-.005.002-.001.002-.018.01-.004.002-.002.002-.017.01-.004.003-.002.002-.017.01-.004.003-.002.002-.016.011-.005.003-.001.002-.017.012-.004.003-.002.002-.016.013-.004.003-.002.002-.015.013-.005.003-.001.003-.016.013-.004.004-.002.002-.015.014-.004.004-.002.002-.015.014-.004.004-.002.002-.014.015-.004.004-.002.002-.014.015-.004.004-.002.002-.013.016-.004.004-.002.003-.013.016-.004.004-.001.003-.013.016-.004.005-.002.002-.012.017-.003.005-.002.002-.012.017-.003.005-.002.003-.011.017-.004.005-.001.003-.011.017-.003.005-.002.003-.01.018-.004.005-.001.003-.01.018-.003.005-.001.003-.01.018-.003.006-.001.003-.009.018-.003.006-.001.003-.009.018-.003.006-.001.003-.008.019-.003.006-.001.003-.008.019-.002.006-.001.003-.007.019-.003.006 0 .004-.008.019-.002.006v.003l-.007.02-.003.006v.003l-.007.02-.002.006v.004l-.006.019-.002.007v.003l-.006.02-.002.006v.004l-.005.02-.002.006v.004l-.005.02-.002.007v.003l-.005.02v.007l-.001.004-.004.02v.007l-.001.004-.003.02-.001.007v.004l-.003.02v.007l-.001.004-.002.02v.007l-.001.005-.002.02v.007l-.001.004v.02l-.001.008v.074zm1.143 2.088v2.73l-2.364 1.365-2.364-1.365V4.095l2.364-1.365zm5.26 1.236 2.113 1.143v2.73l-2.362 1.365-2.364-1.364V6.473zm-10.52 0 2.364 1.143v2.73L5.965 10.57 3.6 9.204V6.473zM12 8.756l2.364 1.365v2.73L12 14.216l-2.364-1.365v-2.73zm-5.26 3.036 2.364 1.365v2.73l-2.364 1.365-2.363-1.365v-2.73zm10.52 0 2.364 1.365v2.73l-2.364 1.365-2.364-1.365v-2.73zM12 14.83l2.364 1.364v2.731L12 20.29l-2.364-1.365v-2.73z"
      />
    </svg>
  )
}

const services = [
  { name: 'MongoDB', icon: Database },
  { name: 'MeiliSearch', icon: FileSearch },
  { name: 'RAG API', icon: Layers },
  { name: 'Vector DB', icon: HardDrive },
]

const methods = [
  {
    id: 'docker',
    icon: DockerLogo,
    title: 'Docker Compose',
    recommended: true,
    href: '/docs/local/docker',
    time: '~5 min',
    difficulty: 'Beginner',
    description:
      'Everything runs in containers. MongoDB, MeiliSearch, RAG API, and Vector DB are all included automatically.',
    prereqs: [
      { label: 'Git', href: 'https://git-scm.com/downloads' },
      { label: 'Docker Desktop', href: 'https://www.docker.com/products/docker-desktop/' },
    ],
    commands: [
      'git clone https://github.com/danny-avila/LibreChat.git',
      'cd LibreChat',
      'cp .env.example .env',
      'docker compose up -d',
    ],
    included: ['MongoDB', 'MeiliSearch', 'RAG API', 'Vector DB'],
  },
  {
    id: 'npm',
    icon: NpmLogo,
    title: 'npm',
    recommended: false,
    href: '/docs/local/npm',
    time: '~20 min',
    difficulty: 'Intermediate',
    description:
      'Run LibreChat directly with Node.js. You manage external services like MongoDB and MeiliSearch yourself.',
    prereqs: [
      { label: 'Node.js v20.19+', href: 'https://nodejs.org/en/download' },
      { label: 'Git', href: 'https://git-scm.com/downloads' },
      { label: 'MongoDB', href: '/docs/configuration/mongodb/mongodb_atlas' },
    ],
    commands: [
      'git clone https://github.com/danny-avila/LibreChat.git',
      'cd LibreChat && npm ci',
      'cp .env.example .env  # edit MONGO_URI',
      'npm run backend',
    ],
    included: [],
  },
  {
    id: 'helm',
    icon: HelmLogo,
    title: 'Helm Chart',
    recommended: false,
    href: '/docs/local/helm_chart',
    time: '~15 min',
    difficulty: 'Advanced',
    description:
      'Deploy on Kubernetes using Helm. Best for production clusters and infrastructure-as-code workflows.',
    prereqs: [
      { label: 'Kubernetes cluster', href: null },
      { label: 'kubectl + Helm', href: null },
    ],
    commands: [
      'kubectl create secret generic librechat-credentials-env ...',
      'helm install librechat oci://ghcr.io/danny-avila/librechat-chart/librechat',
    ],
    included: [],
  },
]

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    Intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors[level] ?? ''}`}>
      {level}
    </span>
  )
}

export function LocalInstallHub() {
  return (
    <div className="not-prose space-y-10">
      {/* Services matrix — what Docker includes */}
      <section aria-labelledby="included-heading">
        <div className="mb-4 flex items-center gap-3">
          <h2
            id="included-heading"
            className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground"
          >
            Bundled with Docker
          </h2>
          <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {services.map((svc) => {
            const Icon = svc.icon
            return (
              <div
                key={svc.name}
                className="flex items-center gap-2.5 rounded-lg border border-fd-border bg-fd-card px-3.5 py-2.5"
              >
                <Icon className="size-4 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-medium text-fd-foreground">{svc.name}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          Docker Compose handles all dependencies. With npm or Helm, you install and configure these
          services separately.
        </p>
      </section>

      {/* Installation methods */}
      <section aria-labelledby="methods-heading">
        <div className="mb-4 flex items-center gap-3">
          <h2
            id="methods-heading"
            className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground"
          >
            Choose a method
          </h2>
          <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
        </div>

        <div className="space-y-4">
          {methods.map((method) => {
            const Icon = method.icon
            return (
              <Link
                key={method.id}
                href={method.href}
                className={`group flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-fd-foreground/[0.03] ${
                  method.recommended
                    ? 'border-fd-foreground/15 bg-fd-card'
                    : 'border-fd-border bg-fd-card'
                } hover:border-fd-foreground/20`}
              >
                {/* Card header */}
                <div className="flex items-start gap-4 border-b border-fd-border p-5">
                  <div
                    className={`shrink-0 rounded-lg border p-2.5 transition-colors ${
                      method.recommended
                        ? 'border-fd-foreground/10 bg-fd-accent'
                        : 'border-fd-border bg-fd-background'
                    } group-hover:border-fd-foreground/20`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-fd-foreground">{method.title}</h3>
                      {method.recommended && (
                        <span className="rounded-full bg-fd-primary px-2.5 py-0.5 text-[11px] font-medium text-fd-primary-foreground">
                          Recommended
                        </span>
                      )}
                      <DifficultyBadge level={method.difficulty} />
                    </div>
                    <p className="text-sm leading-relaxed text-fd-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1.5 text-xs text-fd-muted-foreground sm:flex">
                    <Clock className="size-3" aria-hidden="true" />
                    {method.time}
                  </div>
                </div>

                {/* Card body — prereqs + commands side by side */}
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:gap-6">
                  {/* Prerequisites */}
                  <div className="sm:w-1/3">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
                      Prerequisites
                    </span>
                    <ul className="space-y-1.5">
                      {method.prereqs.map((prereq) => (
                        <li
                          key={prereq.label}
                          className="flex items-center gap-2 text-sm text-fd-muted-foreground"
                        >
                          <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                          {prereq.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick commands */}
                  <div className="flex-1">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-fd-muted-foreground">
                      Commands
                    </span>
                    <div className="overflow-hidden rounded-lg border border-fd-border bg-fd-background">
                      {method.commands.map((cmd, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 px-3 py-1.5 font-mono text-xs text-fd-muted-foreground${
                            i < method.commands.length - 1 ? ' border-b border-fd-border' : ''
                          }`}
                        >
                          <span
                            className="select-none text-fd-muted-foreground/40"
                            aria-hidden="true"
                          >
                            $
                          </span>
                          <span className="break-all">{cmd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="flex items-center justify-between border-t border-fd-border px-5 py-3">
                  {method.included.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Package className="size-3 text-fd-muted-foreground/60" aria-hidden="true" />
                      {method.included.map((name) => (
                        <span
                          key={name}
                          className="rounded border border-fd-border px-1.5 py-0.5 text-[10px] text-fd-muted-foreground"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-fd-muted-foreground/60">
                      External services required
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-fd-foreground transition-colors group-hover:text-fd-foreground/80"
                    aria-hidden="true"
                  >
                    View full guide
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Remote hosting callout */}
      <section aria-labelledby="remote-heading">
        <div className="mb-4 flex items-center gap-3">
          <h2
            id="remote-heading"
            className="shrink-0 text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground"
          >
            Not running locally?
          </h2>
          <div className="h-px flex-1 bg-fd-border" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/docs/remote"
            className="group flex items-center gap-4 rounded-xl border border-fd-border px-5 py-4 transition-colors hover:bg-fd-accent"
          >
            <div className="shrink-0 rounded-md bg-fd-accent p-2 transition-colors group-hover:bg-fd-background">
              <Server
                className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-fd-foreground">Remote Hosting</span>
              <p className="text-xs text-fd-muted-foreground">
                DigitalOcean, Railway, Azure, and more
              </p>
            </div>
            <ArrowRight
              className="size-4 shrink-0 text-fd-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-fd-foreground"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/docs/configuration/dotenv"
            className="group flex items-center gap-4 rounded-xl border border-fd-border px-5 py-4 transition-colors hover:bg-fd-accent"
          >
            <div className="shrink-0 rounded-md bg-fd-accent p-2 transition-colors group-hover:bg-fd-background">
              <Shield
                className="size-4 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-fd-foreground">.env Configuration</span>
              <p className="text-xs text-fd-muted-foreground">
                In-depth guide for environment variables
              </p>
            </div>
            <ArrowRight
              className="size-4 shrink-0 text-fd-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-fd-foreground"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </div>
  )
}
