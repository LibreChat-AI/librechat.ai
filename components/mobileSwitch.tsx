import React, { useState, useEffect, useRef } from 'react'

// Define the breakpoint
const MOBILE_BREAKPOINT = 650

interface MobileSwitchProps {
  mobile: React.ComponentType
  desktop: React.ComponentType
}

export default function MobileSwitch({ mobile: Mobile, desktop: Desktop }: MobileSwitchProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const objectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (objectRef.current) {
        setIsMobile(objectRef.current.offsetWidth <= MOBILE_BREAKPOINT)
      }
    }
    handleResize()

    // Attach event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <div ref={objectRef}>{isMobile === null ? null : isMobile ? <Mobile /> : <Desktop />}</div>
}
