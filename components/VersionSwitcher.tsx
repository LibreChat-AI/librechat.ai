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
import type { DocsVersionOption } from '@/lib/versions'
import { i18n } from '@/lib/i18n'
import { getUI } from '@/lib/ui-i18n'
import { cn } from '@/lib/utils'

/**
 * Docs version switcher shown at the top of the sidebar. The options are built
 * on the server from the archived versions present in content/docs-archive
 * (see lib/docs-archive.ts), so the dropdown grows by adding content.
 *
 * The active version is derived from the current pathname (the option whose
 * base URL is the longest matching prefix) so the trigger and checkmark stay
 * correct while reading archived docs. Links for the live docs keep the active
 * locale so localized readers aren't bounced back to the default-language
 * docs; archived snapshots are English-only and keep their plain URL.
 */
export function VersionSwitcher({ options }: { options: DocsVersionOption[] }) {
  const pathname = usePathname() ?? '/'

  // hideLocale: 'default-locale' keeps the default language at /docs with no
  // prefix; other locales live under /<locale>/docs. Pull the locale off the
  // path so we can rebuild it onto the live docs link.
  const [firstSegment] = pathname.split('/').filter(Boolean)
  const locale =
    firstSegment && firstSegment !== i18n.defaultLanguage && i18n.languages.includes(firstSegment)
      ? firstSegment
      : null
  const localePrefix = locale ? `/${locale}` : ''
  const t = getUI(locale ?? i18n.defaultLanguage).version

  // Strip the locale prefix to compare against the options' canonical URLs.
  const canonicalPath = locale ? pathname.slice(localePrefix.length) || '/' : pathname

  // Active version = the option whose base URL is the longest prefix of the
  // path, falling back to the live docs (e.g. on /docs itself).
  const active =
    [...options]
      .sort((a, b) => b.url.length - a.url.length)
      .find(
        (option) => canonicalPath === option.url || canonicalPath.startsWith(`${option.url}/`),
      ) ??
    options.find((option) => option.current) ??
    options[0]

  if (!active) return null

  // Nothing to switch to until a version is archived: show the version as a
  // label instead of a dropdown that cannot go anywhere.
  if (options.length < 2) {
    return (
      <div className="flex w-full flex-col items-start rounded-lg border border-fd-border bg-fd-card px-3 py-2 text-sm">
        <span className="text-[11px] text-fd-muted-foreground">{t.label}</span>
        <span className="font-medium text-fd-foreground">{active.label}</span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.aria}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-2 text-sm transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <span className="flex flex-col items-start">
          <span className="text-[11px] text-fd-muted-foreground">{t.label}</span>
          <span className="font-medium text-fd-foreground">{active.label}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {options.map((option) => (
          <DropdownMenuItem key={option.id} asChild>
            <Link
              href={option.current ? `${localePrefix}${option.url}` : option.url}
              className="flex items-center justify-between gap-3"
            >
              {option.label}
              <Check
                className={cn('size-4', option.id === active.id ? 'opacity-100' : 'opacity-0')}
                aria-hidden="true"
              />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
