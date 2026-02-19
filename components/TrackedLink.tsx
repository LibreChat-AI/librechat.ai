'use client'

import { track } from '@vercel/analytics'
import type { ReactNode, AnchorHTMLAttributes } from 'react'

export function TrackedLink({
  href,
  title,
  children,
  className,
  ...props
}: {
  href: string
  title?: string
  children: ReactNode
  className?: string
  [key: string]: any
}) {
  const handleClick = () => {
    track('card_click', {
      title: title ?? href,
      href,
    })
  }

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
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
      external: href.startsWith('http'),
    })
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
