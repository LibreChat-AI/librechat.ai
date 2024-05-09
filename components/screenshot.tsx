import cn from 'clsx'
import Image from 'next/image'

export function Screenshot({ src, alt, full, className = '' }) {
  return (
    <div
      className={cn(
        '-mb-4 mt-6 flex justify-center overflow-hidden rounded border dark:border-zinc-800',
        full ? 'bg-white' : 'bg-zinc-100',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        style={{ objectFit: 'contain' }}
        className={cn('w-auto select-none bg-white', full ? '' : 'ring-1 ring-gray-200')}
      />
    </div>
  )
}
