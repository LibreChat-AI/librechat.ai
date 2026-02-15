import { docs, blog, changelog } from '@/.source'
import { loader } from 'fumadocs-core/source'
import { resolveIcon } from '@/lib/icons'

export const docsSource = loader({
  source: docs.toFumadocsSource(),
  baseUrl: '/docs',
  icon: resolveIcon,
})

export { blog, changelog }
