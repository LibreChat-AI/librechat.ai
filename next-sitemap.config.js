const { readdirSync } = require('node:fs')
const { join, relative, sep } = require('node:path')

// Translated docs (content/docs/<path>.<locale>.mdx) render on demand:
// app/[lang]/docs/[[...slug]]/page.tsx pre-renders only the default language, so
// next-sitemap's build-output discovery never sees the localized pages. Enumerate
// them from the content tree and add them back via additionalPaths below; without
// this every /<locale>/docs/* URL drops out of sitemap.xml even though
// generateMetadata still advertises hreflang alternates to it, which hurts crawler
// discovery of the translations. Keys off the `.<locale>.mdx` naming convention
// used elsewhere in the repo (lib/i18n/run.ts, the translate workflow path filters).
const DOCS_DIR = join(__dirname, 'content', 'docs')
const LOCALE_MDX = /\.([a-z]{2}(?:-[A-Z]{2})?)\.mdx$/

function walkFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === '.i18n-cache') continue
      out.push(...walkFiles(join(dir, entry.name)))
    } else {
      out.push(join(dir, entry.name))
    }
  }
  return out
}

// Map each translated file to its on-demand URL, mirroring the docs loader
// (baseUrl '/docs', non-default locales prefixed with the locale, `index` collapses
// to its parent). Filenames carry no numeric ordering prefixes, so the slug is the
// path verbatim.
function translatedDocUrls() {
  const urls = []
  for (const file of walkFiles(DOCS_DIR)) {
    const match = file.match(LOCALE_MDX)
    if (!match) continue
    const locale = match[1]
    const rel = relative(DOCS_DIR, file).split(sep).join('/')
    const slug = rel.slice(0, -`.${locale}.mdx`.length).replace(/(^|\/)index$/, '')
    urls.push(`/${locale}/docs${slug ? `/${slug}` : ''}`)
  }
  return urls
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.librechat.ai',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['*/_meta'],
  // Per-route freshness + priority so search engines crawl the home page and
  // docs more aggressively than legal/utility pages.
  transform: async (config, path) => {
    let { changefreq } = config
    let { priority } = config

    if (path === '/') {
      changefreq = 'daily'
      priority = 1.0
    } else if (/^\/([a-z]{2}(-[A-Z]{2})?\/)?docs(\/|$)/.test(path)) {
      // English (/docs/*) and localized (/<locale>/docs/*) docs alike.
      changefreq = 'weekly'
      priority = 0.9
    } else if (path.startsWith('/blog') || path.startsWith('/changelog')) {
      changefreq = 'daily'
      priority = 0.7
    } else if (/^\/(privacy|tos|cookie|subscribe|unsubscribe)/.test(path)) {
      changefreq = 'yearly'
      priority = 0.3
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }
  },
  // Localized docs render on demand, so they aren't in the build output that
  // next-sitemap scans. Add them explicitly (see the note at the top of the file).
  additionalPaths: async (config) =>
    Promise.all(translatedDocUrls().map((loc) => config.transform(config, loc))),
}
