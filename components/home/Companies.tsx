import React, { useMemo } from 'react'
import Image from 'next/image'

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

/** Company logos section showcasing companies that use LibreChat. */
export const Companies: React.FC = React.memo(() => {
  const logosToShow = useMemo(
    () => Array.from({ length: 8 }, (_, i) => companies[i % companies.length]),
    [],
  )

  return (
    <section className="py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by companies worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of organizations using LibreChat
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logosToShow.map((company, index) => {
            const isFirstFewLogos = index < 4
            const key = `${company.name}-${index}`

            return (
              <div
                key={key}
                className={`flex items-center justify-center px-4 py-2 ${company.logoColor ? 'group' : ''}`}
              >
                {company.logoColor ? (
                  <div className="relative">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="dark:hidden group-hover:opacity-0 transition-opacity duration-300 h-10 w-auto object-contain"
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
                      className="hidden dark:block group-hover:opacity-0 transition-opacity duration-300 h-10 w-auto object-contain"
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
                      className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-auto object-contain"
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
                      className={`h-10 w-auto object-contain ${company.logoDark ? 'dark:hidden' : ''}`}
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
                        className="hidden dark:block h-10 w-auto object-contain"
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
    </section>
  )
})
Companies.displayName = 'Companies'

export default Companies
