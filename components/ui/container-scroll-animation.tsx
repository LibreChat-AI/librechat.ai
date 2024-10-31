import React, { useRef } from 'react'
import { useScroll, useTransform, motion, MotionValue, useSpring } from 'framer-motion'

export const ContainerScroll = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center start'],
  })

  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [2.1, 1.5]
  }

  const scale = useTransform(scrollYProgress, [0, 0.45], scaleDimensions())

  const translateY = useTransform(scrollYProgress, [0, 0.45], [0, -100])
  const translateYSpring = useSpring(translateY, { stiffness: 600, damping: 80 })

  const rotate = useTransform(scrollYProgress, [0.05, 0.45], ['40deg', '0deg'])
  const rotateSpring = useSpring(rotate, { stiffness: 600, damping: 80 })

  return (
    <div
      className="flex flex-col items-center justify-center relative px-2 md:px-60"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-60 h-full w-full relative"
        style={{
          perspective: '500px',
        }}
      >
        <Card rotate={rotateSpring} scale={scale} translateY={translateYSpring}>
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
  rotate: MotionValue<string>
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
      className="max-w-3xl mx-auto h-[25rem] md:h-[30rem] w-full rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  )
}
