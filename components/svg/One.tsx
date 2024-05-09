import * as React from 'react'

function SvgOne(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="-1 0 19 19" {...props}>
      <path d="M16.417 9.6A7.917 7.917 0 118.5 1.683 7.917 7.917 0 0116.417 9.6zM9.666 6.508H8.248L6.09 8.09l.806 1.103 1.222-.945v4.816h1.547z" />
    </svg>
  )
}

export default SvgOne
