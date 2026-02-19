'use client'

import dynamic from 'next/dynamic'

const YAMLChecker = dynamic(() => import('@/components/tools/yamlChecker'), {
  ssr: false,
})

export default function YamlCheckerClient() {
  return <YAMLChecker />
}
