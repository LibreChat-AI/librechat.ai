import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/librechat.svg" alt="" width={20} height={20} aria-hidden="true" />
        LibreChat
      </>
    ),
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
