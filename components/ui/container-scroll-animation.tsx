import React, { useRef } from 'react'
import { useScroll, useTransform, motion, MotionValue, useSpring } from 'framer-motion'

interface ContainerScrollProps {
  children: React.ReactNode
  className?: string
}

export const ContainerScroll: React.FC<ContainerScrollProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center start'],
  })

  console.log(scrollYProgress)

  const translateY = useTransform(scrollYProgress, [0.3, 0.75], [-100, 200])
  const translateYSpring = useSpring(translateY, { stiffness: 600, damping: 80 })

  const rotate = useTransform(scrollYProgress, [0.3, 0.75], ['40deg', '0deg'])
  const rotateSpring = useSpring(rotate, { stiffness: 600, damping: 80 })

  return (
    <div
      className={`flex flex-col items-center justify-center relative px-2 md:px-60 ${className}`}
      ref={containerRef}
    >
      <div
        className="py-10 md:pb-52 md:pt-24 h-auto w-auto relative"
        style={{
          perspective: '800px',
        }}
      >
        <Card rotate={rotateSpring} scale={useSpring(1.5)} translateY={translateYSpring}>
          {children}
        </Card>
      </div>
    </div>
  )
}

export const Card = ({
  rotate,
  scale,
  translateY,
  children,
}: {
  rotate: MotionValue<number | string>
  scale: MotionValue<number>
  translateY: MotionValue<number>
  children: React.ReactNode
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY,
      }}
      className="max-w-3xl mx-auto h-auto w-full rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl">
        {children}
      </div>
    </motion.div>
  )
}
