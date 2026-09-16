import React from 'react'

export default function HubrisIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} {...props}>
      <g fill="currentColor">
        <circle cx="12" cy="12" r="2.4" />
        <circle cx="12" cy="3.5" r="1.4" opacity="0.85" />
        <circle cx="20.5" cy="12" r="1.4" opacity="0.85" />
        <circle cx="12" cy="20.5" r="1.4" opacity="0.85" />
        <circle cx="3.5" cy="12" r="1.4" opacity="0.85" />
      </g>
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.4">
        <line x1="12" y1="12" x2="12" y2="3.5" />
        <line x1="12" y1="12" x2="20.5" y2="12" />
        <line x1="12" y1="12" x2="12" y2="20.5" />
        <line x1="12" y1="12" x2="3.5" y2="12" />
      </g>
    </svg>
  )
}
