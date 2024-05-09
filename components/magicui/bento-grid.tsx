import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode } from 'react'

const BentoGrid = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={cn('grid w-full auto-rows-[13rem] grid-cols-3 gap-3', className)}>
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string
  className: string
  background: ReactNode
  Icon: any
  description: string
  href: string
  cta: string
}) => (
  <Link
    key={name}
    className={cn(
      'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded border',
      // light styles
      'bg-white',
      // dark styles
      'transform-gpu dark:bg-transparent dark:backdrop-blur-md',
      className,
    )}
    href={href}
  >
    {background}
    <div />
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-8 w-8 lg:h-12 lg:w-12 origin-left transform-gpu text-neutral-600 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">{name}</h3>
      <p className="max-w-lg dark:text-neutral-400 text-neutral-500">{description}</p>
    </div>

    <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <Button variant="ghost" size="sm" className="ml-2 pointer-events-auto">
        {cta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/20" />
  </Link>
)

export { BentoCard, BentoGrid }
