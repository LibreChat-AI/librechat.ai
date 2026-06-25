import type { CSSProperties, SVGProps } from 'react'
import {
  Activity,
  Fingerprint,
  Globe2,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Youtube,
} from 'lucide-react'
import GitHub from '@/components/icons/github'
import X from '@/components/icons/x'
import { cn } from '@/lib/utils'
import type { AuthorSocial } from '@/lib/authors'

interface AuthorSocialLinksProps {
  socials: AuthorSocial[]
  authorName: string
  className?: string
  showLabels?: boolean
}

function SocialIcon({ label, className, ...props }: { label: string } & SVGProps<SVGSVGElement>) {
  const normalized = label.toLowerCase()

  if (normalized === 'github') return <GitHub className={className} {...props} />
  if (normalized === 'x') return <X className={className} {...props} />
  if (normalized === 'linkedin') return <Linkedin className={className} {...props} />
  if (normalized === 'email') return <Mail className={className} {...props} />
  if (normalized === 'spotify') return <Music2 className={className} {...props} />
  if (normalized === 'discord') return <MessageCircle className={className} {...props} />
  if (normalized === 'youtube') return <Youtube className={className} {...props} />
  if (normalized === 'orcid') return <Fingerprint className={className} {...props} />
  if (normalized === 'status page') return <Activity className={className} {...props} />

  return <Globe2 className={className} {...props} />
}

export function AuthorSocialLinks({
  socials,
  authorName,
  className,
  showLabels = false,
}: AuthorSocialLinksProps) {
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {socials.map((social, index) => {
        const external = !social.url.startsWith('mailto:')

        return (
          <li
            key={`${social.label}-${social.url}`}
            className="author-card__social-item"
            style={{ '--author-social-index': index } as CSSProperties}
          >
            <a
              href={social.url}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              title={social.label}
              aria-label={`${authorName}: ${social.label}`}
              className={cn(
                'author-social-link group/social inline-flex min-h-11 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-xl hover:bg-muted hover:text-foreground active:scale-[0.96]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                showLabels ? 'gap-2 px-4 py-2.5 text-sm font-medium' : 'size-11',
              )}
            >
              <SocialIcon label={social.label} className="size-4" aria-hidden="true" />
              <span className={showLabels ? '' : 'sr-only'}>{social.label}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
