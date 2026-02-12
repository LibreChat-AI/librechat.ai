import Link from 'next/link'
import { FloatingDock } from '@/components/ui/floating-dock'
import { Github, Linkedin, Twitter, Youtube, Mail } from 'lucide-react'
import Discord from './icons/discord'

const menuItems: {
  heading: string
  items: { name: string; href: string }[]
}[] = [
  {
    heading: 'About',
    items: [
      {
        name: 'About',
        href: '/about',
      },
      { name: 'Contact Us', href: '/about#contact-us' },
      {
        name: 'Features',
        href: '/docs/features',
      },
    ],
  },
  {
    heading: 'Resources',
    items: [
      {
        name: 'Changelog',
        href: '/changelog',
      },
      {
        name: 'Roadmap',
        href: '/blog/2025-02-20_2025_roadmap',
      },
      {
        name: 'Demo',
        href: 'https://chat.librechat.ai/',
      },
      {
        name: 'Status',
        href: 'https://status.librechat.ai/',
      },
    ],
  },
  {
    heading: 'Documentation',
    items: [
      {
        name: 'Get Started',
        href: '/docs',
      },
      {
        name: 'Local Install',
        href: '/docs/local',
      },
      {
        name: 'Remote Install',
        href: '/docs/remote',
      },
    ],
  },
  {
    heading: 'Blog',
    items: [
      { name: 'Blog', href: '/blog' },
      { name: 'Blog Authors', href: '/authors' },
    ],
  },
  {
    heading: 'Newsletter',
    items: [
      {
        name: 'Subscribe',
        href: '/subscribe',
      },
      {
        name: 'Unsubscribe',
        href: '/unsubscribe',
      },
    ],
  },
  {
    heading: 'Legal',
    items: [
      {
        name: 'Terms of services',
        href: '/tos',
      },
      {
        name: 'Privacy policy',
        href: '/privacy',
      },
      {
        name: 'Cookie policy',
        href: '/cookie',
      },
    ],
  },
]

/** Site footer with navigation link columns and social media icon dock. */
const FooterMenu = () => {
  const socialLinks = [
    {
      title: 'GitHub',
      icon: <Github className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://github.librechat.ai/',
    },
    {
      title: 'Discord',
      icon: <Discord className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://discord.librechat.ai/',
    },
    {
      title: 'LinkedIn',
      icon: <Linkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://linkedin.librechat.ai/',
    },
    {
      title: 'Twitter',
      icon: <Twitter className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://x.com/LibreChatAI',
    },
    {
      title: 'YouTube',
      icon: <Youtube className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://www.youtube.com/@LibreChat',
    },
    {
      title: 'Email',
      icon: <Mail className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'mailto:contact@librechat.ai',
    },
  ]

  return (
    <div className="w-full">
      <nav
        aria-label="Footer"
        className="grid grid-cols-2 md:grid-cols-6 text-base gap-y-8 gap-x-2"
      >
        {menuItems.map((menu) => (
          <div key={menu.heading}>
            <p className="pb-2 font-mono font-bold text-primary">{menu.heading}</p>
            <ul className="flex flex-col gap-2">
              {menu.items.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm leading-tight hover:text-primary/80">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex items-center justify-between mt-8">
        <div className="font-sans text-sm">&copy; {new Date().getFullYear()} LibreChat</div>
        <FloatingDock items={socialLinks} desktopClassName="ml-auto" />
      </div>
    </div>
  )
}

export default FooterMenu
