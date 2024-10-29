import Link from 'next/link'
import { Button } from '../ui/button'
import { HomeSection } from './components/HomeSection'
import RepoOfTheDay from '@/components/svg/RepoOfTheDay'
import RossIndex from '@/components/svg/RossIndex'
import React from 'react'

const HERO_TITLE = 'Unify Your\nAI Power'
const HERO_DESCRIPTION =
  'The ultimate open-source hub for all your AI conversations, fully customizable and compatible with any AI provider — all in one sleek interface'
const DEMO_LINK = 'https://demo.librechat.cfd'
const GITHUB_LINK = 'https://github.com/danny-avila/librechat'
const GITHUB_STARS_IMG =
  'https://img.shields.io/github/stars/danny-avila/librechat?label=librechat&style=social'
const REPO_OF_THE_DAY_LINK = 'https://trendshift.io/repositories/4685'
const ROSS_INDEX_LINK = 'https://runacap.com/ross-index/q1-24/'

const HeroTitle = React.memo(() => (
  <h1 className="text-4xl sm:text-7xl lg:text-8xl font-bold font-mono text-center">
    {HERO_TITLE.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ))}
  </h1>
))

const HeroDescription = React.memo(() => (
  <span className="mt-2 text-primary/70 text-2xl sm:text-3xl lg:text-2xl md:text-balance font-semibold tracking-wide text-center">
    {HERO_DESCRIPTION}
  </span>
))

const HeroButtons = React.memo(() => (
  <div className="flex gap-4 flex-wrap items-center justify-center my-16">
    <Button size="xl" variant="cta" className="rounded-xl" asChild>
      <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer">
        Try demo
      </a>
    </Button>
  </div>
))

const HeroLinks = React.memo(() => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-3 items-center justify-items-center my-10 flex-wrap">
    <Link href={GITHUB_LINK}>
      <img alt="LibreChat Github stars" src={GITHUB_STARS_IMG} />
    </Link>
    <a
      href={REPO_OF_THE_DAY_LINK}
      className="flex flex-col sm:flex-row items-center gap-x-2 gap-y-1"
      target="_blank"
      rel="noopener noreferrer"
    >
      <RepoOfTheDay />
    </a>
    <a
      href={ROSS_INDEX_LINK}
      className="flex flex-col sm:flex-row items-center gap-x-2 gap-y-1"
      target="_blank"
      rel="noopener noreferrer"
    >
      <RossIndex />
    </a>
  </div>
))

export function Hero() {
  return (
    <HomeSection>
      <div className="flex flex-col items-center justify-center gap-3 md:min-h-[calc(60vh-100px)] pb-12 lg:py-20">
        <HeroTitle />
        <HeroDescription />
        <HeroButtons />
      </div>
      <HeroLinks />
    </HomeSection>
  )
}
