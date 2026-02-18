import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the LibreChat documentation website.',
}

export default function PrivacyPolicyPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
          <header className="mb-12 not-prose text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: June 13, 2025</p>
          </header>

          <h2>Overview</h2>
          <p>
            This privacy policy describes how the LibreChat documentation website (
            <Link href="https://librechat.ai">librechat.ai</Link>) handles user privacy.
          </p>
          <p>
            <strong>In short: We don&apos;t collect any personal data.</strong>
          </p>

          <h2>No Data Collection</h2>
          <p>The LibreChat documentation website:</p>
          <ul>
            <li>
              <strong>Does not collect</strong> any personal information
            </li>
            <li>
              <strong>Does not use</strong> cookies or tracking technologies
            </li>
            <li>
              <strong>Does not require</strong> user registration or accounts
            </li>
            <li>
              <strong>Does not use</strong> analytics or monitoring tools
            </li>
            <li>
              <strong>Does not store</strong> any user data
            </li>
          </ul>

          <h2>Purpose of This Site</h2>
          <p>
            This website serves exclusively as documentation for the open-source LibreChat project.
            It provides:
          </p>
          <ul>
            <li>Installation and setup guides</li>
            <li>Configuration documentation</li>
            <li>API references</li>
            <li>User guides</li>
            <li>Contributing guidelines</li>
            <li>Changelog and release notes</li>
          </ul>

          <h2>External Links</h2>
          <p>Our documentation may contain links to external resources such as:</p>
          <ul>
            <li>The LibreChat GitHub repository</li>
            <li>Third-party service documentation</li>
            <li>Community forums and discussions</li>
          </ul>
          <p>
            We are not responsible for the privacy practices of these external sites. Please review
            their privacy policies when visiting them.
          </p>

          <h2>Local Browser Storage</h2>
          <p>While we don&apos;t collect any data, your browser may store:</p>
          <ul>
            <li>Theme preferences (light/dark mode) locally</li>
            <li>Navigation state for your convenience</li>
          </ul>
          <p>
            This information is stored only in your browser and is never transmitted to any server.
          </p>

          <h2>Open Source</h2>
          <p>
            LibreChat is an open-source project licensed under the MIT License. The source code is
            publicly available at{' '}
            <Link href="https://github.com/danny-avila/LibreChat">
              github.com/danny-avila/LibreChat
            </Link>
            .
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy for clarity or to reflect changes in our practices.
            Any updates will be posted on this page with a new &ldquo;Last updated&rdquo; date.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about this privacy policy or the LibreChat project, please visit{' '}
            <Link href="https://github.com/danny-avila/LibreChat">our GitHub repository</Link>.
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using this documentation site, you acknowledge that no personal data is collected or
            processed.
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
