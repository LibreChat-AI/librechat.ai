import Link from 'next/link'
import { Github, Linkedin, Youtube, Mail } from 'lucide-react'
import Discord from './icons/discord'
import X from './icons/x'
import { getUI, type UIStrings } from '@/lib/ui-i18n'

type HeadingKey = keyof UIStrings['footer']['headings']
type ItemKey = keyof UIStrings['footer']['items']

const menuItems: {
  heading: HeadingKey
  items: { key: ItemKey; href: string }[]
}[] = [
  {
    heading: 'about',
    items: [
      { key: 'about', href: '/about' },
      { key: 'contactUs', href: '/about#contact-us' },
      { key: 'features', href: '/docs/features' },
    ],
  },
  {
    heading: 'resources',
    items: [
      { key: 'changelog', href: '/changelog' },
      { key: 'roadmap', href: '/blog/2026-02-18_2026_roadmap' },
      { key: 'demo', href: 'https://chat.librechat.ai/' },
      { key: 'status', href: 'https://status.librechat.ai/' },
    ],
  },
  {
    heading: 'documentation',
    items: [
      { key: 'getStarted', href: '/docs' },
      { key: 'localInstall', href: '/docs/local' },
      { key: 'remoteInstall', href: '/docs/remote' },
    ],
  },
  {
    heading: 'blog',
    items: [
      { key: 'blog', href: '/blog' },
      { key: 'blogAuthors', href: '/authors' },
    ],
  },
  {
    heading: 'newsletter',
    items: [
      { key: 'subscribe', href: '/subscribe' },
      { key: 'unsubscribe', href: '/unsubscribe' },
    ],
  },
  {
    heading: 'legal',
    items: [
      { key: 'termsOfService', href: '/tos' },
      { key: 'privacyPolicy', href: '/privacy' },
      { key: 'cookiePolicy', href: '/cookie' },
    ],
  },
]

const socialLinks = [
  {
    title: 'GitHub',
    icon: <Github className="size-4" aria-hidden="true" />,
    href: 'https://github.librechat.ai/',
  },
  {
    title: 'Discord',
    icon: <Discord className="size-4" aria-hidden="true" />,
    href: 'https://discord.librechat.ai/',
  },
  {
    title: 'LinkedIn',
    icon: <Linkedin className="size-4" aria-hidden="true" />,
    href: 'https://linkedin.librechat.ai/',
  },
  {
    title: 'X',
    icon: <X className="size-4" aria-hidden="true" />,
    href: 'https://x.com/LibreChatAI',
  },
  {
    title: 'YouTube',
    icon: <Youtube className="size-4" aria-hidden="true" />,
    href: 'https://www.youtube.com/@LibreChat',
  },
  {
    title: 'Email',
    icon: <Mail className="size-4" aria-hidden="true" />,
    href: 'mailto:contact@librechat.ai',
  },
]

/** Site footer with navigation link columns and social media icon links. */
const FooterMenu = ({ lang }: { lang?: string }) => {
  const t = getUI(lang).footer
  return (
    <footer className="w-full" role="contentinfo">
      <nav
        aria-label="Footer"
        className="grid grid-cols-2 md:grid-cols-6 text-base gap-y-8 gap-x-2"
      >
        {menuItems.map((menu) => (
          <div key={menu.heading}>
            <p className="pb-2 font-mono font-bold text-primary">{t.headings[menu.heading]}</p>
            <ul className="flex flex-col gap-2">
              {menu.items.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-sm leading-tight hover:text-primary/80">
                    {t.items[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex items-center justify-between mt-8">
        <div className="font-sans text-sm">&copy; {new Date().getFullYear()} LibreChat</div>
        <nav aria-label="Social media" className="flex items-center gap-1">
          {socialLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              aria-label={link.title}
              className="flex items-center justify-center size-9 rounded-full text-neutral-500 dark:text-neutral-300 transition-colors duration-200 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {link.icon}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default FooterMenu
