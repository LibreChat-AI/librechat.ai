import { cn } from '@/lib/utils'
import { Tweet as ReactTweet } from 'react-tweet'

export const Tweet = ({ id, className }: { id: string; className?: string }) => (
  <div className={cn('mt-2', className)}>
    <ReactTweet id={id} />
  </div>
)
