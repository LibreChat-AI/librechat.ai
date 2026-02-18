import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for the LibreChat documentation website.',
}

export default function CookiePolicyPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
          <header className="mb-12 not-prose text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cookie Policy
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: June 13, 2025</p>
          </header>

          <h2>No Cookies Used</h2>
          <p>
            The LibreChat documentation website (
            <Link href="https://librechat.ai">librechat.ai</Link>){' '}
            <strong>does not use cookies</strong> or any similar tracking technologies.
          </p>

          <h2>What This Means</h2>
          <ul>
            <li>We don&apos;t set or read any cookies</li>
            <li>We don&apos;t track your browsing behavior</li>
            <li>We don&apos;t collect any personal information</li>
            <li>We don&apos;t use analytics or advertising cookies</li>
            <li>We don&apos;t use third-party tracking services</li>
          </ul>

          <h2>Browser Storage</h2>
          <p>
            While we don&apos;t use cookies, this documentation site may use browser features like:
          </p>
          <ul>
            <li>
              <strong>Local Storage</strong>: To remember your theme preference (light/dark mode)
            </li>
            <li>
              <strong>Session Storage</strong>: To maintain navigation state during your visit
            </li>
          </ul>
          <p>This data:</p>
          <ul>
            <li>Is stored only in your browser</li>
            <li>Is never transmitted to any server</li>
            <li>Can be cleared by clearing your browser data</li>
            <li>Does not identify you personally</li>
          </ul>

          <h2>Third-Party Links</h2>
          <p>
            Our documentation may contain links to external websites that might use cookies. We are
            not responsible for the cookie practices of external sites. Please review their cookie
            policies when visiting them.
          </p>

          <h2>Your Privacy</h2>
          <p>Since we don&apos;t use cookies:</p>
          <ul>
            <li>There&apos;s nothing to accept or decline</li>
            <li>No tracking occurs</li>
            <li>Your browsing is completely private</li>
            <li>No consent banner is needed</li>
          </ul>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this cookie policy for clarity. Any updates will be posted on this page
            with a new &ldquo;Last updated&rdquo; date. However, we do not anticipate adding cookies
            to this documentation site.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about this policy or the LibreChat project, please visit{' '}
            <Link href="https://github.com/danny-avila/LibreChat">our GitHub repository</Link>.
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using this documentation site, you acknowledge that no cookies or tracking
            technologies are employed.
          </p>
        </article>
      </main>
      <div className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FooterMenu />
        </div>
      </div>
    </HomeLayout>
  )
}
