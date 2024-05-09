import * as React from 'react'

function NpmIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 256" preserveAspectRatio="xMidYMid" {...props}>
      <path fill="#C12127" d="M0 256V0h256v256z" />
      <path fill="#FFF" d="M48 48h160v160h-32V80h-48v128H48z" />
    </svg>
  )
}

export default NpmIcon
