import React from 'react'

export default function VLLMIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} {...props}>
      <path fill="currentColor" d="M0 4.973h9.324V23L0 4.973z" />
      <path fill="currentColor" d="M13.986 4.351L22.378 0l-6.216 23H9.324l4.662-18.649z" />
    </svg>
  )
}
