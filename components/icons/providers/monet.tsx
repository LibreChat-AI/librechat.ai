import React from 'react'

export default function MonetIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={className} {...props}>
      <g
        transform="translate(100 100) scale(0.72)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinejoin="round"
      >
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(45)" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(90)" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(135)" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(180)" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(225)" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(270)" />
        <polygon points="-6,-35 6,-35 24,-82 -24,-82" transform="rotate(315)" />
      </g>
    </svg>
  )
}
