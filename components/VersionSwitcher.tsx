'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { versions } from '@/lib/versions'
import { cn } from '@/lib/utils'

/**
 * Docs version switcher shown at the top of the sidebar. Reads the registry in
 * lib/versions.ts; the dropdown grows as archived versions are added.
 */
export function VersionSwitcher() {
  const current = versions.find((v) => v.current) ?? versions[0]
  if (!current) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Select documentation version"
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-fd-border bg-fd-card px-3 py-2 text-sm transition-colors hover:bg-fd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
      >
        <span className="flex flex-col items-start">
          <span className="text-[11px] text-fd-muted-foreground">Version</span>
          <span className="font-medium text-fd-foreground">{current.label}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-fd-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {versions.map((version) => (
          <DropdownMenuItem key={version.id} asChild>
            <Link href={version.url} className="flex items-center justify-between gap-3">
              {version.label}
              <Check
                className={cn('size-4', version.current ? 'opacity-100' : 'opacity-0')}
                aria-hidden="true"
              />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
