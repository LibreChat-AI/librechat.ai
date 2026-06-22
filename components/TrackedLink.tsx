'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isExternalHref, localizeDocsHref } from '@/lib/localize-href'
import type { ReactNode, AnchorHTMLAttributes } from 'react'

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void
  }
}

/** Rewrite an internal /docs link to the active locale; see localizeDocsHref. */
function useLocalizedHref(href: string): string {
  return localizeDocsHref(href, usePathname())
}

export function TrackedLink({
  href,
  title,
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  title?: string
  children: ReactNode
}) {
  const localizedHref = useLocalizedHref(href)
  const handleClick = () => {
    window.plausible?.('card_click', {
      props: {
        title: title ?? href,
        href,
      },
    })
  }

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={localizedHref} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

export function TrackedAnchor({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const localizedHref = useLocalizedHref(href ?? '')
  if (!href) return <a {...props}>{children}</a>

  const handleClick = () => {
    const label = typeof children === 'string' ? children : (props['aria-label'] ?? href)

    window.plausible?.('link_click', {
      props: {
        href,
        label: String(label).slice(0, 100),
        external: isExternalHref(href),
      },
    })
  }

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={localizedHref} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
