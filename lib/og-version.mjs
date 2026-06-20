// @ts-check
/**
 * Content fingerprint for the Open Graph social cards.
 *
 * Every social-card URL (the homepage card and the per-page cards from
 * app/api/og/route.tsx) carries this hash as a `?v=` query param. Because the
 * hash is derived from the bytes that actually determine how a card looks,
 * editing the card template, swapping the logo/fonts, or dropping in a new
 * static card produces a brand-new URL that no CDN edge or social scraper
 * (Discord/WhatsApp/Facebook image proxies) has ever cached. That is the only
 * thing that reliably forces those caches to refetch.
 *
 * Computed once at build time and inlined via `env.OG_VERSION` in
 * next.config.mjs, so there are no filesystem reads at request time (which
 * keeps it safe on serverless/edge). Contributors never hand-edit a version
 * number; the fingerprint updates itself.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Files whose contents determine the rendered card. Keep this in sync with the
 * inputs of app/api/og/route.tsx. The static socialcards are included so that
 * any legacy/author-referenced static card also bumps the fingerprint.
 */
const OG_SOURCES = [
  'app/api/og/route.tsx',
  'lib/fonts/Geist-Regular.ttf',
  'lib/fonts/Geist-SemiBold.ttf',
  'public/librechat.png',
  'public/images/socialcards/default-image.png',
  'public/images/socialcards/default-docs-image.png',
  'public/images/socialcards/default-blog-image.png',
  'public/images/socialcards/default-changelog-image.png',
]

/** @returns {string} short hex fingerprint of the OG card inputs */
export function computeOgVersion() {
  const hash = createHash('sha256')
  for (const rel of OG_SOURCES) {
    try {
      hash.update(readFileSync(join(ROOT, rel)))
    } catch {
      // An optional source that's been renamed/removed simply doesn't
      // contribute to the fingerprint; it must not break the build.
    }
  }
  return hash.digest('hex').slice(0, 12)
}
