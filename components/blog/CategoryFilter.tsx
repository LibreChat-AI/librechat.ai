'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const categories = [
  { label: 'All', value: '' },
  { label: 'Blog', value: 'blog' },
  { label: 'Changelog', value: 'changelog' },
] as const

export function CategoryFilter() {
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? ''

  return (
    <nav aria-label="Filter by category">
      <ul className="flex gap-2" role="list">
        {categories.map(({ label, value }) => {
          const isActive = current === value
          return (
            <li key={value}>
              <Link
                href={value ? `/blog?category=${value}` : '/blog'}
                className={`inline-block rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
