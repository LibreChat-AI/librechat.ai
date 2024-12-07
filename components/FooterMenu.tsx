import Link from 'next/link'
import { FloatingDock } from '@/components/ui/floating-dock'
import {
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandYoutube,
  IconMail,
} from '@tabler/icons-react'
import { useMediaQuery } from 'react-responsive'

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
        name: 'Code Interpreter API',
        href: 'https://code.librechat.ai/pricing',
      },
      {
        name: 'Changelog',
        href: '/changelog',
      },
      {
        name: 'Roadmap',
        href: '/blog/2024-02-19_2024_roadmap',
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
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' })

  const socialLinks = [
    {
      title: 'GitHub',
      icon: <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://github.librechat.ai/',
    },
    {
      title: 'Discord',
      icon: <IconBrandDiscord className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://discord.librechat.ai/',
    },
    {
      title: 'LinkedIn',
      icon: <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://linkedin.librechat.ai/',
    },
    {
      title: 'Twitter',
      icon: <IconBrandTwitter className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://x.com/LibreChatAI',
    },
    {
      title: 'YouTube',
      icon: <IconBrandYoutube className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'https://www.youtube.com/@LibreChat',
    },
    {
      title: 'Email',
      icon: <IconMail className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: 'mailto:contact@librechat.ai',
    },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-6 text-base gap-y-8 gap-x-2">
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
        <div className="flex items-center justify-between md:col-span-6">
          <div className="font-sans text-sm">© {new Date().getFullYear()} LibreChat</div>
          {!isMobile && <FloatingDock items={socialLinks} desktopClassName="ml-auto" />}
        </div>
      </div>
      {isMobile && <FloatingDock items={socialLinks} mobileClassName="mt-4" />}
    </div>
  )
}

export default FooterMenu
