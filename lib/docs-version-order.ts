/**
 * Ordering for archived docs version ids.
 *
 * Ids look like `v0.8.7`, `v0.8.8-rc2` or `v0.7.x`. Kept free of server-only
 * imports so the ordering contract is unit-testable on its own.
 */
export const DOCS_VERSION_ID_PATTERN = /^v\d+\.\d+(?:\.\d+|\.x)?(?:-rc\d*)?$/

/**
 * Sort key, most significant first: major, minor, patch, prerelease.
 *
 * `x` is the open-ended patch of a release series, so it outranks every
 * numbered patch. A release outranks its own release candidates, and `-rc`
 * without a number sorts below `-rc1`.
 */
export function docsVersionSortKey(id: string): number[] {
  const [series, prerelease] = id.slice(1).split('-rc')
  const parts = series
    .split('.')
    .map((part) => (part === 'x' ? Number.POSITIVE_INFINITY : Number(part)))

  while (parts.length < 3) parts.push(0)

  parts.push(prerelease === undefined ? Number.POSITIVE_INFINITY : Number(prerelease || 0))

  return parts
}

/** Newest first. */
export function compareDocsVersionsDescending(left: string, right: string): number {
  const leftKey = docsVersionSortKey(left)
  const rightKey = docsVersionSortKey(right)

  for (let index = 0; index < Math.max(leftKey.length, rightKey.length); index += 1) {
    const leftPart = leftKey[index] ?? 0
    const rightPart = rightKey[index] ?? 0

    // Subtraction would produce NaN for two infinities (`v0.8.x` vs `v0.9.x`).
    if (leftPart > rightPart) return -1
    if (leftPart < rightPart) return 1
  }

  return 0
}
