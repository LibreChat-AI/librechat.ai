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
    let {changefreq} = config
    let {priority} = config

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
