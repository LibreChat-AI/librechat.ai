import { type ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'
import {
  GitFork,
  BrainCog,
  Code,
  Bot,
  Search,
  Image as ImageIcon,
  Terminal,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodeInterpreter from './img/code_interpreter.gif'
import { HomeSection } from './components/HomeSection'
import ArtifactsLight from './img/artifacts_light.png'
import ArtifactsDark from './img/artifacts_dark.png'
import AgentsLight from './img/agents_light.png'
import AgentsDark from './img/agents_dark.png'
import { cn } from '@/lib/utils'
import { Header } from '../Header'
import Link from 'next/link'

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
  Icon: React.ComponentType<{ className?: string }>
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

/** Homepage features showcase using a bento grid layout with linked feature cards. */
export default function Features() {
  return (
    <HomeSection>
      <Header
        title="Unlock Potential"
        description="Explore our unique and powerful features"
        button={{ href: '/docs', text: 'Explore docs' }}
      />
      <div className="grid w-full auto-rows-[13rem] grid-cols-3 gap-3">
        {features.map((feature) => (
          <Link
            key={feature.name}
            className={cn(
              'group relative col-span-3 flex flex-col justify-between overflow-hidden rounded border',
              'bg-white',
              'transform-gpu dark:bg-transparent dark:backdrop-blur-md',
              feature.className,
            )}
            href={feature.href}
          >
            {feature.background}
            <div />
            <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
              <feature.Icon className="h-8 w-8 lg:h-12 lg:w-12 origin-left transform-gpu text-neutral-600 transition-all duration-300 ease-in-out group-hover:scale-75" />
              <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                {feature.name}
              </h3>
              <p className="max-w-lg dark:text-neutral-400 text-neutral-500">
                {feature.description}
              </p>
            </div>
            <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button variant="ghost" size="sm" className="ml-2 pointer-events-auto">
                {feature.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/20" />
          </Link>
        ))}
      </div>
    </HomeSection>
  )
}
