// import NewsletterForm from '@/components/Newsletter/SubscribeForm'
import { Companies } from './Companies'
import Features from './Features'
import { Hero } from './Hero'

export const Home = () => (
  <>
    <main className="relative overflow-hidden w-full">
      <Hero />
      <Companies />
      <Features />
      {/* <NewsletterForm /> */}
    </main>
  </>
)
