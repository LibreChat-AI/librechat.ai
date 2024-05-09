import * as React from 'react'

function SvgFolderTree(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 576 512" fill="currentColor" {...props}>
      <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32v352c0 35.3 28.7 64 64 64h192v-64H64V160h192V96H64V32zm224 160c0 17.7 14.3 32 32 32h224c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32h-98.7c-8.5 0-16.6-3.4-22.6-9.4L409.4 9.4c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32v160zm0 288c0 17.7 14.3 32 32 32h224c17.7 0 32-14.3 32-32V352c0-17.7-14.3-32-32-32h-98.7c-8.5 0-16.6-3.4-22.6-9.4l-13.3-13.3c-6-6-14.1-9.4-22.6-9.4H320c-17.7 0-32 14.3-32 32V480z" />
    </svg>
  )
}

export default SvgFolderTree
