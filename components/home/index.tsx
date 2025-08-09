// import NewsletterForm from '@/components/Newsletter/SubscribeForm'
import { Companies } from './Companies'
import Features from './Features'
import { Usage } from './Usage'
import { Hero } from './Hero'

export const Home = () => (
  <>
    <main className="relative overflow-hidden w-full">
      <Hero />
      <Companies />
      <Usage />
      <Features />
      {/* <NewsletterForm /> */}
    </main>
  </>
)
