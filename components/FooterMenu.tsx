import Link from 'next/link'
import { SocialIcon } from 'react-social-icons'

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
        href: '/blog/2024-02-19_2024_roadmap',
      },
      {
        name: 'Demo',
        href: 'https://demo.librechat.cfd/',
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
          <div className="font-mono text-sm">© {new Date().getFullYear()} LibreChat</div>
          <div className="flex ml-auto">
            <SocialIcon
              url="https://github.librechat.ai/"
              className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
              style={{ height: 40, width: 40 }}
              bgColor="background"
              fgColor="#9B9B9B80"
            />
            <SocialIcon
              url="https://discord.librechat.ai/"
              className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
              style={{ height: 40, width: 40 }}
              bgColor="background"
              fgColor="#9B9B9B80"
            />
            <SocialIcon
              url="https://linkedin.librechat.ai/"
              className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
              style={{ height: 40, width: 40 }}
              bgColor="background"
              fgColor="#9B9B9B80"
            />
            <SocialIcon
              url="https://x.com/LibreChatAI"
              className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
              style={{ height: 40, width: 40 }}
              bgColor="background"
              fgColor="#9B9B9B80"
            />
            <SocialIcon
              url="https://www.youtube.com/@LibreChat"
              className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
              style={{ height: 40, width: 40 }}
              bgColor="background"
              fgColor="#9B9B9B80"
            />
            <SocialIcon
              url="mailto:contact@librechat.ai"
              className="absolute inset-0 w-full h-full transform scale-100 transition-transform opacity-100 hover:scale-90"
              style={{ height: 40, width: 40 }}
              bgColor="background"
              fgColor="#9B9B9B80"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FooterMenu
