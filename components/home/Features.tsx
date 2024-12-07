import { ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'
import { GitFork, BrainCog, Code, Bot, Search, Image as ImageIcon, Terminal } from 'lucide-react'
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import CodeInterpreter from './img/code_interpreter.gif'
import { HomeSection } from './components/HomeSection'
import ArtifactsLight from './img/artifacts_light.png'
import ArtifactsDark from './img/artifacts_dark.png'
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
      className="opacity-60 top-0 right-0 dark:hidden hidden md:block"
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
      className="opacity-60 top-0 right-0 hidden dark:md:block"
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
  background: ReactNode | null
  className: string
}

const features: Feature[] = [
  {
    Icon: Bot,
    name: 'Agents',
    description: 'Advanced agents with file handling, code interpretation, and API actions',
    href: '/docs/features/agents',
    cta: 'Meet the Agents!',
    background: <BentoBgImage imgLight={AgentsLight} imgDark={AgentsDark} alt="Agents" />,
    className: 'md:row-start-1 md:row-end-4 md:col-start-2 md:col-end-2',
  },
  {
    Icon: Terminal,
    name: 'Code Interpreter',
    description:
      'Execute code in multiple languages securely via API with zero setup - Python, JavaScript, TypeScript, Go, and more',
    href: '/docs/features/code_interpreter',
    cta: 'Start Coding!',
    background: (
      <BentoBgImage imgLight={CodeInterpreter} imgDark={CodeInterpreter} alt="Artifacts" />
    ),
    className: 'md:col-start-1 md:col-end-2 md:row-start-1 md:row-end-3',
  },
  {
    Icon: BrainCog,
    name: 'Models',
    description: 'AI model selection including Anthropic, AWS, OpenAI, Azure, and more',
    href: '/docs/configuration/pre_configured_ai',
    cta: 'Pick Your Brain!',
    background: null,
    className: 'md:col-start-1 md:col-end-2 md:row-start-3 md:row-end-4',
  },
  {
    Icon: Code,
    name: 'Artifacts',
    description: 'Create React, HTML code, and Mermaid diagrams in chat',
    href: '/docs/features/artifacts',
    cta: 'Craft Some Code!',
    background: <BentoBgImage imgLight={ArtifactsLight} imgDark={ArtifactsDark} alt="Artifacts" />,
    className: 'md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-2',
  },
  {
    Icon: ImageIcon,
    name: 'Multimodal',
    description: 'Analyze images and chat with files using various endpoints',
    href: '/docs/features',
    cta: 'Image This!',
    background: null,
    className: 'md:col-start-3 md:col-end-3 md:row-start-2 md:row-end-3',
  },
  {
    Icon: GitFork,
    name: 'Fork',
    description:
      'Split messages to create multiple conversation threads for better context control',
    href: '/docs/features/fork',
    cta: 'Fork It Up!',
    background: null,
    className: 'md:col-start-3 md:col-end-3 md:row-start-3 md:row-end-4',
  },
  {
    Icon: Search,
    name: 'Search',
    description: 'Search for messages, files, and code snippets in an instant',
    href: '/docs/configuration/meilisearch',
    cta: 'Find It Fast!',
    background: null,
    className: 'md:col-start-3 md:col-end-3 md:row-start-3 md:row-end-4',
  },
]

export default function Features() {
  return (
    <HomeSection>
      <Header
        title="Unlock Potential"
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
