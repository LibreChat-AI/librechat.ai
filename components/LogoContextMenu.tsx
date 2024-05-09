import {
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Download, ExternalLink } from 'lucide-react'

const LogoContextMenu: React.FC<{
  open: boolean
  setOpen: (open: boolean) => void
}> = ({ open, setOpen }) => {
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger />
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/', '_blank')
          }}
        >
          <ExternalLink size={14} className="mr-2" />
          Open in new tab
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat.png', '_blank')
          }}
        >
          <Download size={14} className="mr-2" />
          Logo (png)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat.svg', '_blank')
          }}
        >
          <Download size={14} className="mr-2" />
          Logo (svg)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat_alt.png', '_blank')
          }}
        >
          <Download size={14} className="mr-2" />
          Docs Logo (png)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            window.open('/librechat_alt.svg', '_blank')
          }}
        >
          <Download size={14} className="mr-2" />
          Docs Logo (svg)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LogoContextMenu
