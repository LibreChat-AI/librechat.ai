import React from 'react'

export default function DynoyardIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M18 16h12c8.837 0 16 7.163 16 16s-7.163 16-16 16H18V16zm10 9v14h2c3.866 0 7-3.134 7-7s-3.134-7-7-7h-2z"
      />
    </svg>
  )
}
