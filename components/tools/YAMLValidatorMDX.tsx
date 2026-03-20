'use client'

import dynamic from 'next/dynamic'

const YAMLValidator = dynamic(() => import('@/components/tools/yamlChecker'), {
  ssr: false,
  loading: () => <div className="h-[500px] animate-pulse rounded-lg bg-fd-muted" />,
})

export function YAMLValidatorMDX() {
  return <YAMLValidator />
}
