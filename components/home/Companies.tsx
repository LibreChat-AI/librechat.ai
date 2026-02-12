import React, { useMemo } from 'react'
import Image from 'next/image'
import styles from './companies.module.css'

interface Company {
  name: string
  logo: string
  logoDark?: string
  logoColor?: string
  url?: string
}

const companies: Company[] = [
  {
    name: 'Shopify',
    logo: '/images/logos/Shopify_light.svg',
    logoDark: '/images/logos/Shopify_dark.svg',
  },
  {
    name: 'ClickHouse',
    logo: '/images/logos/ClickHouse_light.svg',
    logoDark: '/images/logos/ClickHouse_dark.svg',
  },
  {
    name: 'Boston University',
    logo: '/images/logos/BostonUniversity_light.png',
    logoDark: '/images/logos/BostonUniversity_dark.png',
    logoColor: '/images/logos/BostonUniversity_color.png',
  },
  {
    name: 'Daimler Truck',
    logo: '/images/logos/DaimlerTruck_light.svg',
    logoDark: '/images/logos/DaimlerTruck_dark.svg',
  },
]

export const Companies: React.FC = React.memo(() => {
  const minLogos = 8 // Reduced minimum for better performance

  const displayCount = Math.max(minLogos, companies.length)

  const logosToShow = useMemo(
    () => Array.from({ length: displayCount }, (_, i) => companies[i % companies.length]),
    [displayCount],
  )

  // Create duplicated array for seamless infinite scroll
  const duplicatedLogos = useMemo(() => [...logosToShow, ...logosToShow], [logosToShow])

  const baseSpeed = 2
  const duration = useMemo(() => Math.max(40, logosToShow.length * baseSpeed), [logosToShow.length])
  const mobileDuration = useMemo(() => Math.max(30, logosToShow.length * 1.5), [logosToShow.length])

  const containerStyle = useMemo(
    () =>
      ({
        '--scroll-duration': `${duration}s`,
        '--scroll-duration-mobile': `${mobileDuration}s`,
      }) as React.CSSProperties,
    [duration, mobileDuration],
  )

  return (
    <section className="py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Trusted by companies worldwide
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join thousands of organizations using LibreChat
          </p>
        </div>
        <div className={styles.scrollContainer} style={containerStyle}>
          <div className={styles.scrollContent}>
            {duplicatedLogos.map((company, index) => {
              const isFirstFewLogos = index < Math.min(4, logosToShow.length)
              const key = `${company.name}-${index}`

              return (
                <div key={key} className={`${styles.logoItem} ${company.logoColor ? 'group' : ''}`}>
                  {company.logoColor ? (
                    <div className="relative">
                      <Image
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className={`${styles.logo} dark:hidden group-hover:opacity-0 transition-opacity duration-300`}
                        width={120}
                        height={60}
                        sizes="120px"
                        unoptimized={company.logo.endsWith('.svg')}
                        priority={isFirstFewLogos}
                        loading={isFirstFewLogos ? 'eager' : 'lazy'}
                      />
                      <Image
                        src={company.logoDark || company.logo}
                        alt={`${company.name} logo`}
                        className={`${styles.logo} hidden dark:block group-hover:opacity-0 transition-opacity duration-300`}
                        width={120}
                        height={60}
                        sizes="120px"
                        unoptimized={(company.logoDark || company.logo).endsWith('.svg')}
                        priority={isFirstFewLogos}
                        loading={isFirstFewLogos ? 'eager' : 'lazy'}
                      />
                      <Image
                        src={company.logoColor}
                        alt={`${company.name} logo`}
                        className={`${styles.logo} absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        width={120}
                        height={60}
                        sizes="120px"
                        unoptimized={company.logoColor.endsWith('.svg')}
                        priority={isFirstFewLogos}
                        loading={isFirstFewLogos ? 'eager' : 'lazy'}
                      />
                    </div>
                  ) : (
                    <>
                      <Image
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className={`${styles.logo} ${company.logoDark ? 'dark:hidden' : ''}`}
                        width={120}
                        height={60}
                        sizes="120px"
                        unoptimized={company.logo.endsWith('.svg')}
                        priority={isFirstFewLogos}
                        loading={isFirstFewLogos ? 'eager' : 'lazy'}
                      />
                      {company.logoDark && (
                        <Image
                          src={company.logoDark}
                          alt={`${company.name} logo`}
                          className={`${styles.logo} hidden dark:block`}
                          width={120}
                          height={60}
                          sizes="120px"
                          unoptimized={company.logoDark.endsWith('.svg')}
                          priority={isFirstFewLogos}
                          loading={isFirstFewLogos ? 'eager' : 'lazy'}
                        />
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
})

export default Companies
