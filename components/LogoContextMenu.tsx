import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Download, ExternalLink } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { i18n } from '@/lib/i18n'
import { getUI } from '@/lib/ui-i18n'

const LogoContextMenu: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
}> = ({ open, setOpen }) => {
  const pathname = usePathname() ?? '/'
  const [firstSegment] = pathname.split('/').filter(Boolean)
  const locale = i18n.languages.includes(firstSegment) ? firstSegment : i18n.defaultLanguage
  const t = getUI(locale).logoMenu
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger />
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/', '_blank', 'noopener')
          }}
        >
          <ExternalLink size={14} className="mr-2" />
          {t.openNewTab}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat.png', '_blank', 'noopener')
          }}
        >
          <Download size={14} className="mr-2" />
          {t.logoPng}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat.svg', '_blank', 'noopener')
          }}
        >
          <Download size={14} className="mr-2" />
          {t.logoSvg}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat_alt.png', '_blank', 'noopener')
          }}
        >
          <Download size={14} className="mr-2" />
          {t.docsLogoPng}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat_alt.svg', '_blank', 'noopener')
          }}
        >
          <Download size={14} className="mr-2" />
          {t.docsLogoSvg}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LogoContextMenu
