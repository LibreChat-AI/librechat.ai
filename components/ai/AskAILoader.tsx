'use client'

import dynamic from 'next/dynamic'

const AskAI = dynamic(
  () => import('@/components/ai/AskAI').then((m) => ({ default: m.AskAI })),
  { ssr: false },
)

export function AskAILoader() {
  return <AskAI />
}
