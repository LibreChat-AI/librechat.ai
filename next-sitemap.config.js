/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.librechat.ai',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    // Content-Signal (https://contentsignals.org) states what crawlers may do
    // with the pages they fetch. The docs are open-source content and the Terms
    // (app/tos/page.tsx) already welcome well-behaved AI-training crawlers, so
    // every signal is opt-in: train on it, index it, ground answers in it.
    transformRobotsTxt: async (_, robotsTxt) =>
      robotsTxt.replace(
        'User-agent: *',
        'User-agent: *\nContent-Signal: ai-train=yes, search=yes, ai-input=yes',
      ),
  },
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
    } else if (path.startsWith('/docs')) {
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
}
