import { Hero } from './Hero'
import Feature from './feature'
import NewsletterForm from '@/components/Newsletter/SubscribeForm'

export const Home = () => (
  <>
    <main className="relative overflow-hidden w-full">
      <Hero />
      <Feature locate={''} />
      <NewsletterForm />
    </main>
  </>
)
