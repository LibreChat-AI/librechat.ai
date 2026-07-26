import { Globe, BarChart3, Database, Server, Gauge, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

/**
 * Diagram for the ClickHouse analytics blog post: the path a pageview takes from
 * the browser through Plausible CE into ClickHouse, with PostgreSQL and the
 * separate Core Web Vitals store shown as satellites rather than in the hot path.
 *
 * Server-rendered, theme-aware via the fd-* tokens. The arrows are decorative
 * (aria-hidden); the node labels carry the meaning, and the whole figure has an
 * aria-label that reads the flow as one sentence for screen readers.
 */

function Node({
  icon: Icon,
  title,
  subtitle,
  muted = false,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  subtitle: string
  muted?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-center',
        muted ? 'border-dashed border-fd-border bg-transparent' : 'border-fd-border bg-fd-card',
      )}
    >
      <Icon
        className={cn('h-6 w-6', muted ? 'text-fd-muted-foreground/70' : 'text-fd-foreground')}
      />
      <div className="text-sm font-medium leading-tight">{title}</div>
      <div className="text-xs leading-snug text-fd-muted-foreground">{subtitle}</div>
    </div>
  )
}

function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      className="h-5 w-5 shrink-0 rotate-90 self-center text-fd-muted-foreground/60 sm:rotate-0"
    />
  )
}

export function AnalyticsArchitecture() {
  return (
    <figure
      className="not-prose my-8"
      aria-label="Data flow: the browser sends events to Plausible Community Edition, which writes them to ClickHouse Cloud. Plausible keeps its site and user configuration in PostgreSQL. A separate ClickHouse instance stores Core Web Vitals."
    >
      <div className="rounded-xl border border-fd-border bg-fd-card/40 p-4 sm:p-6">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-stretch">
          <Node icon={Globe} title="Your browser" subtitle="~1 KB script, no cookies" />
          <Arrow />
          <Node icon={BarChart3} title="Plausible CE" subtitle="open-source analytics app" />
          <Arrow />
          <Node icon={Database} title="ClickHouse Cloud" subtitle="columnar event store" />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Node
            icon={Server}
            title="PostgreSQL"
            subtitle="sites, users, settings — not events"
            muted
          />
          <Node
            icon={Gauge}
            title="Core Web Vitals"
            subtitle="separate ClickHouse, separate tenant"
            muted
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-fd-muted-foreground">
        Every pageview crosses three hops. The interesting one is the last.
      </figcaption>
    </figure>
  )
}
