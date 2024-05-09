import RetroGrid from '../magicui/retro-grid'
import { HomeSection } from './components/HomeSection'

export const Footer = () => (
  <HomeSection className="max-w-none px-0 sm:px-0 xl:px-0 last:pb-0">
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden border-b py-20 lg:py-32">
      <div className="pointer-events-none whitespace-pre-wrap z-10 flex justify-around px-5 max-w-7xl w-full text-3xl font-mono lowercase sm:text-4xl lg:text-5xl xl:text-6xl">
        {['L', 'i', 'b', 'r', 'e', 'C', 'h', 'a', 't'].map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </div>
      <RetroGrid />
    </div>
  </HomeSection>
)
