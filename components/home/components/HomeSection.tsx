import { cn } from '@/lib/utils'
import React, { forwardRef } from 'react'

/** Wrapper section for homepage content blocks with consistent vertical spacing and max-width. */
export const HomeSection = forwardRef<
  HTMLElement,
  { children: React.ReactNode; className?: string; id?: string }
>((props, ref) => {
  return (
    <section
      id={props.id}
      ref={ref}
      className={cn('py-20 lg:py-32 mx-auto max-w-7xl', props.className)}
    >
      {props.children}
    </section>
  )
})

HomeSection.displayName = 'HomeSection'
