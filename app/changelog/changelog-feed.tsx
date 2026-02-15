'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ChangelogEntry {
  title: string
  description?: string
  date: string
  url: string
  version?: string
  type: 'release' | 'config'
}

type Filter = 'all' | 'release' | 'config'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'release', label: 'Releases' },
  { value: 'config', label: 'Config' },
]

export function ChangelogFeed({ entries }: { entries: ChangelogEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter)

  return (
    <div>
      <nav aria-label="Filter changelog entries" className="mb-8 flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <section aria-label="Changelog entries" className="relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

        <ol className="space-y-6">
          {filtered.map((entry) => (
            <li key={entry.url} className="relative pl-8">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-2.5 size-[15px] rounded-full border-2 border-border ${
                  entry.type === 'config' ? 'bg-muted' : 'bg-foreground'
                }`}
                aria-hidden="true"
              />

              <article>
                <Link
                  href={entry.url}
                  className="group block rounded-lg border border-border p-5 transition-colors hover:bg-muted"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <time dateTime={entry.date} className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    {entry.version && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {entry.type === 'config' ? `Config v${entry.version}` : `v${entry.version}`}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.type === 'config'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {entry.type === 'config' ? 'Config' : 'Release'}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-foreground group-hover:text-foreground/80">
                    {entry.title}
                  </h2>
                  {entry.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                </Link>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
