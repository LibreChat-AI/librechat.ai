import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import DemoImageMobileLight from './img/demo_mobile_light.png'
import DemoImageMobileDark from './img/demo_mobile_dark.png'
import { HomeSection } from './components/HomeSection'
import DemoImageLight from './img/demo_light.png'
import DemoImageDark from './img/demo_dark.png'

const HERO_TITLE = {
  firstPart: 'Unify',
  highlight: 'AI',
  lastPart: 'Power',
}
const HERO_DESCRIPTION =
  ' is the ultimate open-source app for all your AI conversations, fully customizable and compatible with any AI provider — all in one sleek interface'
const DEMO_LINK = 'https://chat.librechat.ai/'

const HeroTitle = React.memo(() => (
  <div className="w-full text-center">
    <h1 className="text-7xl lg:text-9xl font-bold font-mono inline-block">
      {HERO_TITLE.firstPart}{' '}
      <span className="relative inline-block text-foreground">
        {HERO_TITLE.highlight}
        <div className="absolute -bottom-1 left-0 right-0">
          <div className="bg-gradient-to-r from-transparent via-muted-foreground to-transparent h-[2px] blur-sm" />
          <div className="bg-gradient-to-r from-transparent via-muted-foreground to-transparent h-px" />
        </div>
      </span>{' '}
      {HERO_TITLE.lastPart}
    </h1>
  </div>
))
HeroTitle.displayName = 'HeroTitle'

const HeroDescription = React.memo(() => (
  <span className="mt-4 text-muted-foreground text-base md:text-lg lg:text-2xl tracking-wide text-center p-2 lg:p-0">
    <span className="font-semibold text-foreground">LibreChat</span>
    {HERO_DESCRIPTION}
  </span>
))
HeroDescription.displayName = 'HeroDescription'

const HeroLinks = React.memo(() => (
  <div className="flex items-center justify-center gap-x-6 flex-wrap">
    <Link
      href={DEMO_LINK}
      target="_blank"
      rel="noopener"
      className="inline-flex items-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      aria-label="Try the LibreChat demo"
    >
      Try demo
    </Link>
  </div>
))
HeroLinks.displayName = 'HeroLinks'

/** Homepage hero section with title, description, CTA links, and responsive demo screenshots. */
export function Hero() {
  return (
    <HomeSection>
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 mt-4 md:min-h-[calc(60vh-100px)] lg:py-20 px-4">
        <HeroTitle />
        <HeroDescription />
        <HeroLinks />
        {/* Desktop */}
        <div className="hidden md:block w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
          <Image
            src={DemoImageDark}
            alt="LibreChat UI Dark"
            height={800}
            width={1600}
            className="dark:block hidden mx-auto rounded-2xl object-cover object-left-top w-full"
            draggable={false}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 32rem, (max-width: 1024px) 36rem, (max-width: 1280px) 42rem, 672px"
          />
          <Image
            src={DemoImageLight}
            alt="LibreChat UI Light"
            height={800}
            width={1600}
            className="block dark:hidden mx-auto rounded-2xl object-cover object-left-top w-full"
            draggable={false}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 32rem, (max-width: 1024px) 36rem, (max-width: 1280px) 42rem, 672px"
          />
        </div>
        {/* Mobile */}
        <div className="block md:hidden">
          <Image
            src={DemoImageMobileDark}
            alt="LibreChat UI Dark Mobile"
            height={400}
            width={800}
            className="dark:block hidden mx-auto rounded-2xl object-cover object-left-top w-full max-w-sm"
            draggable={false}
            priority
            sizes="(max-width: 640px) 24rem, 384px"
          />
          <Image
            src={DemoImageMobileLight}
            alt="LibreChat UI Light Mobile"
            height={400}
            width={800}
            className="block dark:hidden mx-auto rounded-2xl object-cover object-left-top w-full max-w-sm"
            draggable={false}
            priority
            sizes="(max-width: 640px) 24rem, 384px"
          />
        </div>
      </div>
    </HomeSection>
  )
}
