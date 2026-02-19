'use client'

import { track } from '@vercel/analytics'
import type { ReactNode } from 'react'

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
