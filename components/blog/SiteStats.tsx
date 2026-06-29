import { cn } from '@/lib/utils'

/**
 * Live-ish stats card for the ClickHouse analytics blog post.
 *
 * When PLAUSIBLE_STATS_API_KEY is set, this server component queries the
 * self-hosted Plausible Stats API (v2) at request time, cached for an hour, and
 * shows the real librechat.ai numbers. Without the key — local dev, preview
 * builds, anyone forking the repo — it falls back to a dated snapshot of the
 * figures pulled straight from ClickHouse, so the post always renders and never
 * fails a build on a missing secret.
 *
 * No secret is ever shipped to the client: the fetch runs on the server and only
 * the rendered numbers reach the browser.
 */

type Stat = { label: string; value: string }
type Stats = { mode: 'live' | 'snapshot'; period: string; items: Stat[] }

// Real figures read from ClickHouse at migration time (2026-06-25). Used when no
// Plausible API key is configured. Honest and dated rather than invented-live.
const SNAPSHOT: Stats = {
  mode: 'snapshot',
  period: 'snapshot · June 2026',
  items: [
    { label: 'Events stored', value: '1.9M' },
    { label: 'Sessions', value: '222K' },
    { label: 'On disk', value: '≈28 MiB' },
  ],
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

async function getLiveStats(): Promise<Stats | null> {
  const key = process.env.PLAUSIBLE_STATS_API_KEY
  if (!key) return null

  const siteId = process.env.PLAUSIBLE_SITE_ID ?? 'librechat.ai'
  const baseUrl = process.env.PLAUSIBLE_BASE_URL ?? 'https://plausible.librechat.ai'

  try {
    const res = await fetch(`${baseUrl}/api/v2/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        site_id: siteId,
        metrics: ['visitors', 'pageviews', 'visits'],
        date_range: '30d',
      }),
      signal: AbortSignal.timeout(4000),
      // Cache for an hour so a popular post doesn't hammer the analytics box.
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null
    const data = (await res.json()) as { results?: { metrics?: number[] }[] }
    const metrics = data.results?.[0]?.metrics
    if (!metrics || metrics.length < 3) return null

    const [visitors, pageviews, visits] = metrics
    return {
      mode: 'live',
      period: 'last 30 days · live',
      items: [
        { label: 'Unique visitors', value: compact.format(visitors) },
        { label: 'Pageviews', value: compact.format(pageviews) },
        { label: 'Visits', value: compact.format(visits) },
      ],
    }
  } catch {
    // Network error, timeout, bad JSON — fall back to the snapshot.
    return null
  }
}

export async function SiteStats() {
  const stats = (await getLiveStats()) ?? SNAPSHOT
  const isLive = stats.mode === 'live'

  return (
    <div className="not-prose my-8 rounded-xl border border-fd-border bg-fd-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">librechat.ai</div>
          <div className="text-xs text-fd-muted-foreground">{stats.period}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-fd-border px-2.5 py-1 text-xs text-fd-muted-foreground">
          <span
            aria-hidden="true"
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isLive ? 'animate-pulse bg-emerald-500' : 'bg-fd-muted-foreground/50',
            )}
          />
          {isLive ? 'Live via Plausible' : 'Snapshot'}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-3 sm:gap-6">
        {stats.items.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs text-fd-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-xs text-fd-muted-foreground">
        Counted by Plausible, stored in ClickHouse. No cookies, no cross-site tracking.
      </p>
    </div>
  )
}
