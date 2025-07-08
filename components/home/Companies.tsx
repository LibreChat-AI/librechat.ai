import React from 'react'
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
]

export const Companies = () => {
  const minLogos = 15
  const duplicateCount = Math.ceil(minLogos / companies.length)
  const duplicatedCompanies = Array(duplicateCount * 2)
    .fill(companies)
    .flat()

  const baseSpeed = 2
  const duration = Math.max(70, companies.length * baseSpeed)
  const mobileDuration = Math.max(15, companies.length * 1.5)

  const containerStyle = {
    '--scroll-duration': `${duration}s`,
    '--scroll-duration-mobile': `${mobileDuration}s`,
  } as React.CSSProperties

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
            {duplicatedCompanies.map((company, index) => (
              <div
                key={`logo-${index}`}
                className={`${styles.logoItem} ${company.logoColor ? 'group' : ''}`}
              >
                {company.logoColor ? (
                  <div className="relative">
                    {/* Light logo */}
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className={`${styles.logo} dark:hidden group-hover:opacity-0 transition-opacity duration-300`}
                      width={120}
                      height={60}
                      unoptimized
                      priority={index < companies.length}
                    />
                    {/* Dark logo */}
                    <Image
                      src={company.logoDark}
                      alt={`${company.name} logo`}
                      className={`${styles.logo} hidden dark:block group-hover:opacity-0 transition-opacity duration-300`}
                      width={120}
                      height={60}
                      unoptimized
                      priority={index < companies.length}
                    />
                    {/* Color logo */}
                    <Image
                      src={company.logoColor}
                      alt={`${company.name} logo`}
                      className={`${styles.logo} absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      width={120}
                      height={60}
                      unoptimized
                      priority={index < companies.length}
                    />
                  </div>
                ) : (
                  <>
                    {/* Light logo */}
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className={`${styles.logo} ${company.logoDark ? 'dark:hidden' : ''}`}
                      width={120}
                      height={60}
                      unoptimized
                      priority={index < companies.length}
                    />
                    {company.logoDark && (
                      <Image
                        src={company.logoDark}
                        alt={`${company.name} logo`}
                        className={`${styles.logo} hidden dark:block`}
                        width={120}
                        height={60}
                        unoptimized
                        priority={index < companies.length}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Companies
