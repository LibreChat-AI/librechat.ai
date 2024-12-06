import React from 'react'
import Link from 'next/link'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { CardBody, CardContainer, CardItem } from '../ui/3d-card'
import { HoverBorderGradient } from '../ui/hover-border-gradient'
import RepoOfTheDay from '@/components/svg/RepoOfTheDay'
import { HomeSection } from './components/HomeSection'
import RossIndex from '@/components/svg/RossIndex'
import DemoImage from './img/demo.png'
import Image from 'next/image'

const HERO_TITLE = {
  firstPart: 'Unify Your',
  highlight: 'AI',
  lastPart: 'Power',
}
const HERO_DESCRIPTION =
  'The ultimate open-source app for all your AI conversations, fully customizable and compatible with any AI provider — all in one sleek interface'
const DEMO_LINK = 'https://preview.librechat.ai/'
// const GITHUB_LINK = 'https://github.com/danny-avila/librechat'
// const GITHUB_STARS_IMG =
//   'https://img.shields.io/github/stars/danny-avila/librechat?label=librechat&style=social'
const REPO_OF_THE_DAY_LINK = 'https://trendshift.io/repositories/4685'
const ROSS_INDEX_LINK = 'https://runacap.com/ross-index/q1-24/'

const HeroTitle = React.memo(() => (
  <div className="w-full text-center">
    <h1 className="text-7xl lg:text-9xl font-bold font-mono inline-block">
      {HERO_TITLE.firstPart}{' '}
      <span className="relative inline-block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
        {HERO_TITLE.highlight}
        <div className="absolute -bottom-1 left-0 right-0">
          <div className="bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] blur-sm" />
          <div className="bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px" />
          <div className="bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] blur-sm" />
          <div className="bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
        </div>
      </span>{' '}
      {HERO_TITLE.lastPart}
    </h1>
  </div>
))

const HeroDescription = React.memo(() => (
  <span className="mt-2 text-primary/70 text-lg lg:text-xl md:text-balance tracking-wide text-center p-2 lg:p-0">
    {HERO_DESCRIPTION}
  </span>
))

const HeroLinks = React.memo(() => (
  <div className="flex items-center justify-center gap-x-16 flex-wrap">
    <CardContainer className="inter-var">
      <Link href={REPO_OF_THE_DAY_LINK}>
        <CardBody className="bg-transparent w-auto h-auto px-12">
          <CardItem
            translateZ="100"
            className="cursor-pointer shadow-2xl dark:hover:shadow-emerald-500/[0.1]"
          >
            <RepoOfTheDay />
          </CardItem>
        </CardBody>
      </Link>
    </CardContainer>
    <div className="flex gap-4 flex-wrap items-center justify-center">
      <HoverBorderGradient
        onClick={() => window.open(DEMO_LINK, '_blank')}
        containerClassName="rounded-full"
        as="button"
        className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
      >
        <span>Try demo</span>
      </HoverBorderGradient>
    </div>
    {/* <CardContainer className="inter-var">
      <Link href={GITHUB_LINK}>
        <CardBody className="bg-transparent w-auto h-auto px-12">
          <CardItem
            translateZ="100"
            className="cursor-pointer shadow-2xl dark:hover:shadow-emerald-500/[0.1]"
          >
            <img alt="LibreChat Github stars" src={GITHUB_STARS_IMG} />
          </CardItem>
        </CardBody>
      </Link>
    </CardContainer> */}
    <CardContainer className="inter-var">
      <Link href={ROSS_INDEX_LINK}>
        <CardBody className="bg-transparent w-full h-full px-12">
          <CardItem
            translateZ="100"
            className="cursor-pointer shadow-2xl dark:hover:shadow-emerald-500/[0.1]"
          >
            <RossIndex />
          </CardItem>
        </CardBody>
      </Link>
    </CardContainer>
  </div>
))

export function Hero() {
  return (
    <HomeSection>
      <div className="flex flex-col items-center justify-center gap-3 md:min-h-[calc(60vh-100px)] lg:py-20">
        <HeroTitle />
        <HeroDescription />
        <HeroLinks />
        <ContainerScroll>
          <Image
            src={DemoImage}
            alt="LibreChat UI"
            height={800}
            width={1600}
            className="mx-auto rounded-2xl object-cover object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    </HomeSection>
  )
}
