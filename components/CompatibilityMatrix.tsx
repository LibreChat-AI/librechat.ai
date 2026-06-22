import Link from 'next/link'
import {
  endpoints,
  capabilities,
  matrix,
  SUPPORT_LEGEND,
  LAST_REVIEWED,
  type Support,
} from '@/lib/compatibility-data'

const CELL_CLASS: Record<Support, string> = {
  yes: 'text-emerald-600 dark:text-emerald-400',
  no: 'text-fd-muted-foreground/50',
  model: 'text-amber-600 dark:text-amber-400',
  agents: 'text-sky-600 dark:text-sky-400',
}

/**
 * Model/endpoint capability matrix. Server-rendered semantic table; each cell
 * carries a screen-reader label (the visible glyph is decorative). Data lives
 * in lib/compatibility-data.ts.
 */
export function CompatibilityMatrix() {
  return (
    <div className="not-prose my-6">
      {/* Legend */}
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Legend">
        {(Object.keys(SUPPORT_LEGEND) as Support[]).map((key) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className={`font-semibold ${CELL_CLASS[key]}`} aria-hidden="true">
              {SUPPORT_LEGEND[key].symbol}
            </span>
            <span className="text-fd-muted-foreground">{SUPPORT_LEGEND[key].label}</span>
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto rounded-lg border border-fd-border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            LibreChat capability support by endpoint type. Rows are capabilities, columns are
            endpoints.
          </caption>
          <thead>
            <tr className="border-b border-fd-border bg-fd-muted/50">
              <th scope="col" className="px-4 py-2.5 text-left font-semibold">
                Capability
              </th>
              {endpoints.map((endpoint) => (
                <th
                  key={endpoint.id}
                  scope="col"
                  className="px-3 py-2.5 text-center font-semibold whitespace-nowrap"
                >
                  {endpoint.href ? (
                    <Link href={endpoint.href} className="hover:underline">
                      {endpoint.name}
                    </Link>
                  ) : (
                    endpoint.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((capability) => (
              <tr key={capability.id} className="border-b border-fd-border last:border-0">
                <th scope="row" className="px-4 py-2.5 text-left font-medium whitespace-nowrap">
                  {capability.href ? (
                    <Link href={capability.href} className="hover:underline">
                      {capability.name}
                    </Link>
                  ) : (
                    capability.name
                  )}
                </th>
                {endpoints.map((endpoint) => {
                  const state = matrix[capability.id]?.[endpoint.id] ?? 'no'
                  const legend = SUPPORT_LEGEND[state]
                  return (
                    <td key={endpoint.id} className="px-3 py-2.5 text-center">
                      <span
                        className={`text-base font-semibold ${CELL_CLASS[state]}`}
                        aria-hidden="true"
                      >
                        {legend.symbol}
                      </span>
                      <span className="sr-only">{legend.label}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-fd-muted-foreground">
        Quick reference, maintained manually. &ldquo;Depends on the model&rdquo; means the
        capability is available when the selected model supports it. Verify against your deployed
        version. Last reviewed: {LAST_REVIEWED}.
      </p>
    </div>
  )
}
