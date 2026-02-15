import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'LibreChat',
  },
  links: [
    {
      text: 'Docs',
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: 'Blog',
      url: '/blog',
    },
    {
      text: 'Changelog',
      url: '/changelog',
    },
  ],
  githubUrl: 'https://github.com/danny-avila/LibreChat',
}
