import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { GitFork, BrainCog, Code, Bot, Search, Image as ImageIcon } from 'lucide-react'
import Image, { type StaticImageData } from 'next/image'
import { HomeSection } from './components/HomeSection'
import AgentsLight from './img/agents_light.png'
import AgentsDark from './img/agents_dark.png'
import { Header } from '../Header'

const BentoBgImage = ({
  imgLight,
  imgDark,
  alt,
}: {
  imgLight: StaticImageData
  imgDark: StaticImageData
  alt: string
}) => (
  <>
    <Image
      className="opacity-30 top-0 right-0 dark:hidden hidden md:block"
      style={{
        objectFit: 'contain',
        objectPosition: 'top right',
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 15%, rgba(0,0,0,1))',
      }}
      src={imgLight}
      fill
      alt={alt}
      sizes="(min-width: 1024px) 33vw, 100vw"
    />
    <Image
      className="opacity-30 top-0 right-0 hidden dark:md:block"
      style={{
        objectFit: 'contain',
        objectPosition: 'top right',
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 15%, rgba(0,0,0,1))',
      }}
      src={imgDark}
      fill
      alt={alt}
      sizes="(min-width: 1024px) 33vw, 100vw"
    />
  </>
)

type Feature = {
  Icon: React.ComponentType
  name: string
  description: string
  href: string
  cta: string
  background: React.ReactNode | null
  className: string
}

const features: Feature[] = [
  {
    Icon: Bot,
    name: 'Agents',
    description: 'Advanced agents with file handling, code interpretation, and API actions',
    href: '/docs/tracing',
    cta: 'Explore Agents',
    background: <BentoBgImage imgLight={AgentsLight} imgDark={AgentsDark} alt="Tracing" />,
    className: 'md:row-start-1 md:row-end-4 md:col-start-2 md:col-end-2',
  },
  {
    Icon: Code,
    name: 'Artifacts',
    description: 'Create React, HTML code, and Mermaid diagrams in chat',
    href: '/docs/user_guides/artifacts',
    cta: 'Discover Artifacts',
    background: null,
    className: 'md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3',
  },
  {
    Icon: BrainCog,
    name: 'Models',
    description: 'AI model selection including Anthropic, AWS, OpenAI, Azure, and more',
    href: '/docs/configuration/pre_configured_ai',
    cta: 'Select Your Model',
    background: null,
    className: 'md:col-start-1 md:col-end-2 md:row-start-3 md:row-end-4',
  },
  {
    Icon: ImageIcon,
    name: 'Multimodal',
    description: 'Analyze images and chat with files using various endpoints',
    href: '/docs/user_guides/rag_api',
    cta: 'Analyze Images',
    background: null,
    className: 'md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-2',
  },
  {
    Icon: GitFork,
    name: 'Fork',
    description:
      'Split messages to create multiple conversation threads for better context control',
    href: '/docs/user_guides/fork',
    cta: 'Fork this!',
    background: null,
    className: 'md:col-start-3 md:col-end-3 md:row-start-2 md:row-end-3',
  },
  {
    Icon: Search,
    name: 'Search',
    description: 'Search for messages, files, and code snippets in an instant',
    href: '/docs/configuration/meilisearch',
    cta: 'Search!',
    background: null,
    className: 'md:col-start-3 md:col-end-3 md:row-start-3 md:row-end-4',
  },
]

export default function Features() {
  return (
    <HomeSection id="features">
      <Header
        title="Discover the Possibilities"
        description="Explore our unique and powerful features"
        button={{ href: '/docs', text: 'Explore docs' }}
      />
      <BentoGrid>
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </HomeSection>
  )
}
