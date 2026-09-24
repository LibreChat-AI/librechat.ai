import { Callout } from 'fumadocs-ui/components/callout'
import { CURRENT_VERSION } from '@/lib/versions'

/**
 * Shown at the top of every archived docs page. `currentHref` is the same slug
 * on the live docs when it still exists, otherwise the live docs root.
 */
export function ArchivedVersionBanner({
  version,
  currentHref,
}: {
  version: string
  currentHref: string
}) {
  return (
    <Callout type="warn" title="Archived documentation">
      <p className="m-0">
        You are reading the frozen documentation for <strong>{version}</strong>, which is no longer
        maintained.{' '}
        <a href={currentHref} className="font-medium underline">
          Go to the {CURRENT_VERSION} docs
        </a>
        .
      </p>
    </Callout>
  )
}
