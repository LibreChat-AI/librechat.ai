export type Theme =
  | 'light'
  | 'dark'
  | 'cupcake'
  | 'bumblebee'
  | 'emerald'
  | 'corporate'
  | 'synthwave'
  | 'retro'
  | 'cyberpunk'
  | 'valentine'
  | 'halloween'
  | 'garden'
  | 'forest'
  | 'aqua'
  | 'lofi'
  | 'pastel'
  | 'fantasy'
  | 'wireframe'
  | 'black'
  | 'luxury'
  | 'dracula'
  | ''

export interface ConfigProps {
  appName: string
  bgImage: string
  appDescription: string
  domainName: string
  crisp: {
    id?: string
    onlyShowOnRoutes?: string[]
  }
  stripe: {
    plans: {
      isFeatured?: boolean
      priceId: string
      name: string
      description?: string
      price: number
      priceAnchor?: number
      features: {
        name: string
      }[]
    }[]
  }
  aws?: {
    bucket?: string
    bucketUrl?: string
    cdn?: string
  }
  mailgun: {
    subdomain: string
    fromNoReply: string
    fromAdmin: string
    supportEmail?: string
    forwardRepliesTo?: string
  }
  colors: {
    theme: Theme
    main: string
  }
  auth: {
    loginUrl: string
    callbackUrl: string
  }
}
