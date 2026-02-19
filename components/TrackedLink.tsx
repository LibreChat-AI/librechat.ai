'use client'

import Link from 'next/link'
import { track } from '@vercel/analytics'
import type { ReactNode, AnchorHTMLAttributes } from 'react'

function isExternalHref(href: string): boolean {
  return href.startsWith('http') || href.startsWith('mailto:')
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
  const handleClick = () => {
    track('card_click', {
      title: title ?? href,
      href,
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
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

export function TrackedAnchor({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  if (!href) return <a {...props}>{children}</a>

  const handleClick = () => {
    const label = typeof children === 'string' ? children : (props['aria-label'] ?? href)

    track('link_click', {
      href,
      label: String(label).slice(0, 100),
      external: isExternalHref(href),
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
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
