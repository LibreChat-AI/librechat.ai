import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for the LibreChat documentation website.',
}

export default function TermsOfServicePage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
          <header className="mb-12 not-prose text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: June 13, 2025</p>
          </header>

          <p>
            Welcome to the LibreChat documentation website, available at{' '}
            <Link href="https://librechat.ai">librechat.ai</Link>. These Terms of Service govern
            your use of our documentation website.
          </p>

          <h2>1. Purpose and Scope</h2>
          <p>
            This website provides documentation for LibreChat, an open-source AI chat platform. The
            site is purely informational and includes:
          </p>
          <ul>
            <li>Technical documentation</li>
            <li>Installation and setup guides</li>
            <li>Configuration references</li>
            <li>API documentation</li>
            <li>Contributing guidelines</li>
            <li>Blog posts related to LibreChat</li>
          </ul>

          <h2>2. No Commercial Services</h2>
          <p>This documentation site:</p>
          <ul>
            <li>Does not sell any products or services</li>
            <li>Does not require payment for access</li>
            <li>Does not collect user data or personal information</li>
            <li>Does not require user registration or accounts</li>
          </ul>

          <h2>3. Open Source Project</h2>
          <p>
            LibreChat is an open-source project licensed under the MIT License. The source code is
            available at{' '}
            <Link href="https://github.com/danny-avila/LibreChat">
              github.com/danny-avila/LibreChat
            </Link>
            .
          </p>

          <h2>4. Use of Documentation</h2>
          <p>You may freely:</p>
          <ul>
            <li>Access and read all documentation</li>
            <li>Share links to the documentation</li>
            <li>Use the documentation to implement and configure LibreChat</li>
            <li>Contribute improvements to the documentation via GitHub</li>
          </ul>

          <h2>5. No Warranty</h2>
          <p>
            This documentation is provided &ldquo;as is&rdquo; without warranty of any kind. While
            we strive for accuracy, we make no guarantees about:
          </p>
          <ul>
            <li>The completeness or accuracy of the documentation</li>
            <li>The suitability of LibreChat for any particular purpose</li>
            <li>The availability of this documentation site</li>
          </ul>

          <h2>6. External Resources</h2>
          <p>
            Our documentation may reference or link to third-party services, tools, or resources. We
            are not responsible for:
          </p>
          <ul>
            <li>The content or practices of external sites</li>
            <li>The availability of external resources</li>
            <li>Any issues arising from the use of third-party services</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>
            The documentation content is licensed under the MIT License, consistent with the
            LibreChat project. You are free to use, modify, and distribute the documentation in
            accordance with this license.
          </p>

          <h2>8. Changes to Terms</h2>
          <p>
            We may update these terms to reflect changes in the project or for clarity. Updates will
            be posted on this page with a new effective date.
          </p>

          <h2>9. Contact</h2>
          <p>
            For questions about these terms or to contribute to the project, please visit{' '}
            <Link href="https://github.com/danny-avila/LibreChat">our GitHub repository</Link>.
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using this documentation site, you agree to these Terms of Service.
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
