'use client'

import type { ReactNode } from 'react'

interface ButtonProps {
  children?: ReactNode
  [key: string]: any
}

export function ClientButton({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>
}
