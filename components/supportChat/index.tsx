import dynamic from 'next/dynamic'

export { openChat } from './chat'

export const CrispWidget = dynamic(() => import('./chat'), {
  ssr: false,
})
