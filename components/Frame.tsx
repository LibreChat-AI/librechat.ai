import { cn } from '@/lib/utils'

export const Frame = ({
  children,
  className,
  border = false,
  fullWidth = false,
  transparent = false,
}: {
  children: React.ReactNode
  className?: string
  border?: boolean
  fullWidth?: boolean
  transparent?: boolean
}) => (
  <div
    className={cn(
      'my-4',
      border &&
        'p-1 pb-0 bg-gradient-to-tr from-blue-300/50 via-green-200/50 to-yellow-300/50 inline-block rounded',
      className,
    )}
  >
    <div
      className={cn(
        'inline-block rounded overflow-hidden bg-primary/5 max-w-2xl [&>*]:mt-0',
        fullWidth && 'max-w-full',
        transparent && 'bg-transparent',
        border && '[&>*]:-mb-1',
      )}
    >
      {children}
    </div>
  </div>
)
