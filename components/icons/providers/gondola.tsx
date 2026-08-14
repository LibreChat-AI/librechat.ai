import React from 'react'

export default function GondolaIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} {...props}>
      <path
        fill="currentColor"
        d="M3 13.125H21C21.75 13.5 22.5 14.25 22.5 15.75C19.5 18 15.75 19.125 12 19.125C8.25 19.125 4.5 18 1.5 15.75C1.5 14.25 2.25 13.5 3 13.125Z"
      />
      <path
        d="M1.875 13.875l-.9-3 1.875.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.75 12.75l6-6.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
