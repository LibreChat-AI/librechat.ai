import cn from 'clsx'

export function TwoCards({ children, className }) {
  return <div className={cn('flex flex-col md:flex-row gap-5', className)}>{children}</div>
}

export function Divider({ text }) {
  return (
    <div className="hidden md:relative">
      <div className="absolute inset-0 flex flex-col items-center" aria-hidden="true">
        <div className="h-full border-l border-gray-300 dark:border-gray-800" />
      </div>
      <div className="relative flex flex-col h-full justify-center">
        <div className="bg-white dark:bg-transparent py-2 text-sm text-gray-500 dark:text-white">
          {text}
        </div>
      </div>
    </div>
  )
}

export function StartCard({ children, isOutline }) {
  return (
    <div
      className={cn(
        'flex-1 flex-col rounded-md ring-1 [&>h2]:mt-0 [&>h3]:mt-0 [&>h4]:mt-0 ring-gray-200 dark:ring-gray-800 p-5 bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))]',
        isOutline
          ? 'bg-transparent from-transparent via-transparent to-transparent ring-2'
          : 'from-slate-100 via-slate-400 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800',
      )}
    >
      {children}
    </div>
  )
}
