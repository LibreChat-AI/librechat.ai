import * as React from 'react'

function SvgTerminal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" stroke="currentColor" {...props}>
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
        d="M80 96l40 32-40 32"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={16} d="M136 160h40" />
      <rect
        fill="none"
        height={160}
        rx={8.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16.97}
        width={192}
        x={32}
        y={48}
      />
    </svg>
  )
}

export default SvgTerminal
