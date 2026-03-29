/**
 * @deprecated This component is unused — the homepage was rewritten in app/page.tsx.
 * Kept temporarily for reference. Safe to delete.
 */
import Features from './Features'
import { Hero } from './Hero'

export const Home = () => (
  <>
    <main className="relative w-full overflow-hidden">
      <Hero />
      <Features />
    </main>
  </>
)
