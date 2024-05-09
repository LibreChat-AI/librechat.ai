import ArrowRight from '../svg/ArrowRight'
import cn from 'clsx'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './style.module.css'

export function Feature({
  medium,
  large,
  centered,
  children,
  lightOnly,
  className,
  href,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, margin: '-20px' }}
      transition={{ duration: 0.5 }}
      className={cn(
        styles.feature,
        large && styles.large,
        medium && styles.medium,
        centered && styles.centered,
        lightOnly && styles['light-only'],
        className,
      )}
      {...props}
    >
      {children}
      {href ? (
        <Link className={styles.link} href={href} target="_blank">
          <ArrowRight width="1.5em" />
        </Link>
      ) : null}
    </motion.div>
  )
}

export function Features({ children }: { children: ReactNode }) {
  return <div className={styles.features}>{children}</div>
}
