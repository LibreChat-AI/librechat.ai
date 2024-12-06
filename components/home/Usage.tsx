// import Image, { type StaticImageData } from 'next/image'
import { HomeSection } from './components/HomeSection'
// import Link from 'next/link'
import NumberTicker from '@/components/ui/number-ticker'
import DateTicker from '@/components/ui/date-ticker'

// type User = {
//   name: string
//   lightImage: StaticImageData
//   darkImage: StaticImageData
//   href: string
//   className?: string
// }
//
// const users: User[] = [
//   {
//     name: '',
//     lightImage: ,
//     darkImage: ,
//     href: '',
//   },
// ]

const stats = [
  { name: 'GitHub stars', value: 19500 },
  { name: 'Docker pulls', value: 2810000 },
  { name: 'Project started', value: new Date('2023-01-11') },
]

export const Usage = () => (
  <HomeSection className="pt-2 sm:pt-2 lg:pt-2 xl:pt-2">
    <div className="py-14">
      <h2 className="text-center text-lg font-semibold leading-8 mb-8">Usage statistics</h2>
      <div className="flex flex-col gap-8">
        <div className="relative">
          <div className="flex flex-wrap xl:flex-nowrap justify-between">
            {/* {users.map((user) => (
              <a
                key={user.name}
                href={user.href}
                className="overflow-hidden w-1/2 md:w-1/4 xl:w-[12%] h-16 hover:opacity-100 opacity-80 transition py-4 px-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={user.lightImage}
                  alt={user.name}
                  className="object-contain h-full w-full hidden dark:block"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
                <Image
                  src={user.darkImage}
                  alt={user.name}
                  className="object-contain h-full w-full dark:hidden"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />
              </a>
            ))} */}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-around sm:justify-center gap-4 sm:gap-10">
          {stats.map((item) => (
            <div key={item.name} className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-primary/80 font-mono">
                {item.name === 'Project started' && item.value instanceof Date ? (
                  <DateTicker targetDate={item.value} />
                ) : typeof item.value === 'number' ? (
                  <NumberTicker value={item.value} />
                ) : (
                  item.value.toString()
                )}
                <span className="ml-1 hidden sm:inline">{'+'}</span>
              </p>
              <p className="mt-2 text-xs sm:text-sm text-primary/70">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </HomeSection>
)
