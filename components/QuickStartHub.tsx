import Link from 'next/link'
import {
  Container,
  Plug,
  Download,
  Settings,
  Play,
  FileCode,
  ArrowRight,
} from 'lucide-react'

const guides = [
  {
    icon: Container,
    title: 'Local Setup',
    description: 'Get LibreChat running on your machine using Docker in just a few steps.',
    href: '/docs/quick_start/local_setup',
    steps: [
      { icon: Download, label: 'Download the project' },
      { icon: Container, label: 'Install Docker' },
      { icon: Settings, label: 'Configure environment' },
      { icon: Play, label: 'Start LibreChat' },
    ],
  },
  {
    icon: Plug,
    title: 'Custom Endpoints',
    description:
      'Connect to OpenRouter, Ollama, Deepseek, Groq, Mistral, Databricks, and other OpenAI-compatible services.',
    href: '/docs/quick_start/custom_endpoints',
    steps: [
      { icon: FileCode, label: 'Create Docker override' },
      { icon: Settings, label: 'Configure librechat.yaml' },
      { icon: Plug, label: 'Add provider endpoints' },
      { icon: Play, label: 'Restart and use' },
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

export function QuickStartHub() {
  return (
    <nav className="not-prose space-y-10" aria-label="Quick start guides">
      {/* Guides */}
      <section aria-labelledby="guides-heading">
        <SectionHeading>
          <span id="guides-heading">Choose a Guide</span>
        </SectionHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="group relative flex flex-col rounded-xl border border-fd-border bg-fd-card p-6 transition-all duration-200 hover:border-fd-foreground/20 hover:shadow-lg hover:shadow-fd-foreground/[0.03]"
              >
                <div className="mb-4 inline-flex rounded-lg border border-fd-border bg-fd-background p-2.5 transition-colors group-hover:border-fd-foreground/20">
                  <Icon
                    className="size-5 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-fd-foreground">{guide.title}</h3>
                <p className="mb-5 text-sm leading-relaxed text-fd-muted-foreground">
                  {guide.description}
                </p>

                {/* Step preview */}
                <ol className="mb-5 flex flex-1 flex-col gap-2.5" aria-label={`${guide.title} steps`}>
                  {guide.steps.map((step, i) => {
                    const StepIcon = step.icon
                    return (
                      <li key={step.label} className="flex items-center gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fd-accent text-[10px] font-semibold text-fd-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="text-xs text-fd-muted-foreground">{step.label}</span>
                      </li>
                    )
                  })}
                </ol>

                <span
                  className="inline-flex items-center gap-1 text-sm font-medium text-fd-muted-foreground transition-all group-hover:gap-1.5 group-hover:text-fd-foreground"
                  aria-hidden="true"
                >
                  Start guide
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Tip */}
      <section aria-labelledby="tip-heading">
        <SectionHeading>
          <span id="tip-heading">Not sure where to start?</span>
        </SectionHeading>
        <p className="text-sm leading-relaxed text-fd-muted-foreground">
          If this is your first time, start with{' '}
          <Link
            href="/docs/quick_start/local_setup"
            className="font-medium text-fd-foreground underline decoration-fd-border underline-offset-4 transition-colors hover:decoration-fd-foreground"
          >
            Local Setup
          </Link>{' '}
          to get LibreChat running with Docker. Once running, use{' '}
          <Link
            href="/docs/quick_start/custom_endpoints"
            className="font-medium text-fd-foreground underline decoration-fd-border underline-offset-4 transition-colors hover:decoration-fd-foreground"
          >
            Custom Endpoints
          </Link>{' '}
          to connect additional AI providers beyond the defaults.
        </p>
      </section>
    </nav>
  )
}
