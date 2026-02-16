import React from 'react'

export default function ApipieIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} {...props}>
      <path
        fill="currentColor"
        d="M15 2a9 9 0 1 1-4.716 16.684L4.38 21.38a1.5 1.5 0 0 1-1.76-1.76l2.696-5.904A9 9 0 0 1 15 2zm0 2a7 7 0 1 0 3.256 13.196l.382-.202 1.906-.81-.81 1.906-.202.382A7 7 0 1 0 15 4zm-1 2a5 5 0 0 1 4.33 2.5l-4.33 2.5V6zm0 6.155l4.33 2.5A5 5 0 0 1 14 17.155v-5zm-1-.155L8.67 9.5a5 5 0 0 1 4.33-2.5V12z"
      />
    </svg>
  )
}
