'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

import { cn } from '@/lib/utils'

export default function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className,
}: {
  value: number
  direction?: 'up' | 'down'
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const startValue = direction === 'down' ? value : Math.floor(value * 0.75)
  const motionValue = useMotionValue(startValue)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 150,
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    isInView &&
      setTimeout(() => {
        motionValue.set(direction === 'down' ? Math.floor(value * 0.75) : value)
      }, delay * 1000)
  }, [motionValue, isInView, delay, value, direction])

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat('en-US').format(Number(latest.toFixed(0)))
        }
      }),
    [springValue],
  )

  return <span className={cn('inline-block tabular-nums tracking-wider', className)} ref={ref} />
}
