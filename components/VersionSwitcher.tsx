'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { versions } from '@/lib/versions'
import { i18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Docs version switcher shown at the top of the sidebar. Reads the registry in
 * lib/versions.ts; the dropdown grows as archived versions are added.
 *
 * The active version is derived from the current pathname (the registry entry
 * whose base URL is the longest matching prefix) so the trigger and checkmark
 * stay correct while reading archived docs. Links keep the active locale so
 * localized readers aren't bounced back to the default-language docs.
 */
export function VersionSwitcher() {
  const pathname = usePathname() ?? '/'

  // hideLocale: 'default-locale' keeps the default language at /docs with no
  // prefix; other locales live under /<locale>/docs. Pull the locale off the
  // path so we can rebuild it onto every version link.
  const [firstSegment] = pathname.split('/').filter(Boolean)
  const locale =
    firstSegment && firstSegment !== i18n.defaultLanguage && i18n.languages.includes(firstSegment)
      ? firstSegment
      : null
  const localePrefix = locale ? `/${locale}` : ''

  // Strip the locale prefix to compare against the registry's canonical URLs.
  const canonicalPath = locale ? pathname.slice(localePrefix.length) || '/' : pathname

  // Active version = the entry whose base URL is the longest prefix of the path,
  // falling back to the registry's latest flag (e.g. on /docs itself).
  const active =
    [...versions]
      .sort((a, b) => b.url.length - a.url.length)
      .find((v) => canonicalPath === v.url || canonicalPath.startsWith(`${v.url}/`)) ??
    versions.find((v) => v.current) ??
    versions[0]

  if (!active) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Select documentation version"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-2 text-sm transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <span className="flex flex-col items-start">
          <span className="text-[11px] text-fd-muted-foreground">Version</span>
          <span className="font-medium text-fd-foreground">{active.label}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {versions.map((version) => (
          <DropdownMenuItem key={version.id} asChild>
            <Link
              href={`${localePrefix}${version.url}`}
              className="flex items-center justify-between gap-3"
            >
              {version.label}
              <Check
                className={cn('size-4', version.id === active.id ? 'opacity-100' : 'opacity-0')}
                aria-hidden="true"
              />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
