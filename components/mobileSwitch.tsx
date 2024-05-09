import React, { useState, useEffect, useRef } from 'react'

// Define the breakpoint
const MOBILE_BREAKPOINT = 650

export default function MobileSwitch(props: {
  mobile: React.ElementType
  desktop: React.ElementType
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const objectRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(objectRef.current.offsetWidth <= MOBILE_BREAKPOINT)
    }
    handleResize()

    // Attach event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div ref={objectRef}>{isMobile === null ? null : isMobile ? props.mobile : props.desktop}</div>
  )
}
