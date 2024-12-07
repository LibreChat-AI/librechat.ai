'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function DateTicker({
  targetDate,
  startDate,
  delay = 0,
  className,
}: {
  targetDate: Date
  startDate?: Date
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const initialDate = startDate || new Date(targetDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const motionValue = useMotionValue(initialDate.getTime())
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(targetDate.getTime())
      }, delay * 1000)
    }
  }, [motionValue, isInView, delay, targetDate])

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          const date = new Date(latest)
          ref.current.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }
      }),
    [springValue],
  )

  return <span className={cn('inline-block tabular-nums tracking-wider', className)} ref={ref} />
}
