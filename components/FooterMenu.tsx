import Link from 'next/link'
import { FloatingDock } from '@/components/ui/floating-dock'
import { Github, Linkedin, Twitter, Youtube, Mail } from 'lucide-react'

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

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

const FooterMenu = () => {
  const socialLinks = [
    {
      title: 'GitHub',
      icon: <Github className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://github.librechat.ai/',
    },
    {
      title: 'Discord',
      icon: <DiscordIcon className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
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
