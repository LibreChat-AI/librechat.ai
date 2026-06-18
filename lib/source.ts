import { docs, blog, changelog } from '@/.source'
import { loader } from 'fumadocs-core/source'
import { resolveIcon } from '@/lib/icons'
import { i18n } from '@/lib/i18n'

export const docsSource = loader({
  source: docs.toFumadocsSource(),
  baseUrl: '/docs',
  i18n,
  icon: resolveIcon,
})

export { blog, changelog }
