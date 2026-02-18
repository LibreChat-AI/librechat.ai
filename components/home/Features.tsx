import { type ReactNode } from 'react'
import Image, { type StaticImageData } from 'next/image'
import {
  Bot,
  Terminal,
  Settings2,
  Code,
  Search,
  Plug,
  Brain,
  Globe,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodeInterpreter from './img/code_interpreter.gif'
import { HomeSection } from './components/HomeSection'
import ArtifactsLight from './img/artifacts_light.png'
import ArtifactsDark from './img/artifacts_dark.png'
import AgentsLight from './img/agents_light.png'
import AgentsDark from './img/agents_dark.png'
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
      className="opacity-50 top-0 right-0 dark:hidden hidden md:block"
      style={{
        objectFit: 'contain',
        objectPosition: 'top right',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)',
      }}
      src={imgLight}
      fill
      alt={alt}
      sizes="(min-width: 1024px) 33vw, 100vw"
    />
    <Image
      className="opacity-50 top-0 right-0 hidden dark:md:block"
      style={{
        objectFit: 'contain',
        objectPosition: 'top right',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)',
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
}

const features: Feature[] = [
  {
    Icon: Bot,
    name: 'Agents',
    description: 'Advanced agents with file handling, code interpretation, and API actions',
    href: '/docs/features/agents',
    cta: 'Meet the Agents',
    background: <BentoBgImage imgLight={AgentsLight} imgDark={AgentsDark} alt="Agents" />,
  },
  {
    Icon: Terminal,
    name: 'Code Interpreter',
    description: 'Execute code in multiple languages securely with zero setup',
    href: '/docs/features/code_interpreter',
    cta: 'Start Coding',
    background: (
      <BentoBgImage imgLight={CodeInterpreter} imgDark={CodeInterpreter} alt="Code Interpreter" />
    ),
  },
  {
    Icon: Settings2,
    name: 'Models',
    description: 'AI model selection including Anthropic, AWS, OpenAI, Azure, and more',
    href: '/docs/configuration/pre_configured_ai',
    cta: 'Browse Models',
    background: null,
  },
  {
    Icon: Code,
    name: 'Artifacts',
    description: 'Create React, HTML code, and Mermaid diagrams in chat',
    href: '/docs/features/artifacts',
    cta: 'Craft Some Code',
    background: <BentoBgImage imgLight={ArtifactsLight} imgDark={ArtifactsDark} alt="Artifacts" />,
  },
  {
    Icon: Search,
    name: 'Search',
    description: 'Search for messages, files, and code snippets in an instant',
    href: '/docs/configuration/meilisearch',
    cta: 'Find It Fast',
    background: null,
  },
  {
    Icon: Plug,
    name: 'MCP',
    description: 'Connect to any tool or service with Model Context Protocol support',
    href: '/docs/features/mcp',
    cta: 'Connect Tools',
    background: null,
  },
  {
    Icon: Brain,
    name: 'Memory',
    description: 'Persistent context across conversations so your AI remembers you',
    href: '/docs/features/memory',
    cta: 'Learn More',
    background: null,
  },
  {
    Icon: Globe,
    name: 'Web Search',
    description: 'Give any model live internet access with built-in search and reranking',
    href: '/docs/features/web_search',
    cta: 'Explore Search',
    background: null,
  },
  {
    Icon: ShieldCheck,
    name: 'Authentication',
    description: 'Enterprise-ready SSO with OAuth, SAML, LDAP, and two-factor auth',
    href: '/docs/configuration/authentication',
    cta: 'Secure Your Instance',
    background: null,
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
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.name}
            className="group relative flex h-52 flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors dark:border-neutral-800 dark:bg-neutral-950"
            href={feature.href}
          >
            {feature.background}
            <div className="pointer-events-none z-10 flex flex-col gap-1 p-5 transition-all duration-300 group-hover:-translate-y-8">
              <feature.Icon className="mb-1 size-7 text-neutral-500 transition-all duration-300 group-hover:scale-90 dark:text-neutral-400" />
              <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                {feature.name}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                {feature.description}
              </p>
            </div>
            <div className="pointer-events-none absolute bottom-0 flex w-full translate-y-10 items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button variant="ghost" size="sm" className="pointer-events-auto">
                {feature.cta}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </div>
            <div className="pointer-events-none absolute inset-0 transition-colors duration-300 group-hover:bg-black/[.02] dark:group-hover:bg-white/[.02]" />
          </Link>
        ))}
      </div>
    </HomeSection>
  )
}
