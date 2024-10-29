import { Hero } from './Hero'
import { Usage } from './Usage'
import Features from './Features'
import NewsletterForm from '@/components/Newsletter/SubscribeForm'

export const Home = () => (
  <>
    <main className="relative overflow-hidden w-full">
      <Hero />
      <Usage />
      <Features />
      <NewsletterForm />
    </main>
  </>
)
