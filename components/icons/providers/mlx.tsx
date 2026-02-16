import React from 'react'

export default function MLXIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} {...props}>
      <path
        fill="currentColor"
        d="M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4zm0 1.5h16a.5.5 0 0 1 .5.5v16a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5zM6.5 7v10h1.25V11.2L9.5 14.1h1l1.75-2.9V17h1.25V7h-1.2L10 11.5 7.7 7H6.5zm8.7 0l2.05 3.3L15.2 13.6h1.45l1.35-2.2 1.35 2.2h1.45l-2.05-3.3L20.8 7h-1.45l-1.35 2.2L16.65 7H15.2z"
      />
    </svg>
  )
}
