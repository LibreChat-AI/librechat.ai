import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service governing access to and use of the LibreChat documentation website (librechat.ai).',
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
            <p className="mt-4 text-sm text-muted-foreground">Last updated: April 26, 2026</p>
          </header>

          <h2>1. Agreement</h2>
          <p>
            These Terms of Service (the &ldquo;Terms&rdquo;) govern your access to and use of the
            LibreChat documentation website at <Link href="https://librechat.ai">librechat.ai</Link>{' '}
            (the &ldquo;Site&rdquo;), operated by the LibreChat project maintainers
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing or using the
            Site, you agree to be bound by these Terms. If you do not agree, please do not use the
            Site.
          </p>
          <p>
            These Terms apply to the documentation website only. The LibreChat application itself,
            which you self-host and operate, is licensed separately under the{' '}
            <Link href="https://github.com/danny-avila/LibreChat/blob/main/LICENSE">
              MIT License
            </Link>
            . Use of the public LibreChat Demo is governed by its separate{' '}
            <Link href="/demo/terms">Demo Terms of Service</Link> and{' '}
            <Link href="/demo/privacy">Demo Privacy Policy</Link>.
          </p>

          <h2>2. Purpose of the Site</h2>
          <p>
            The Site exists to host informational and technical content about the open-source
            LibreChat project, including:
          </p>
          <ul>
            <li>Installation, configuration, and operations guides.</li>
            <li>Reference documentation for features, APIs, and integrations.</li>
            <li>Release notes, changelogs, and roadmap information.</li>
            <li>Blog posts, tutorials, and project announcements.</li>
            <li>Contributing guidelines and community resources.</li>
          </ul>
          <p>
            The Site is provided free of charge, does not require registration, and does not offer
            commercial products or paid services.
          </p>

          <h2>3. Eligibility</h2>
          <p>
            The Site is intended for software developers, IT administrators, and other professional
            users. By using the Site you represent that you have the legal capacity to enter into
            these Terms in your jurisdiction. If you access the Site on behalf of an employer or
            another organization, you represent that you have the authority to bind that
            organization to these Terms.
          </p>

          <h2>4. Open-Source Project</h2>
          <p>
            LibreChat is an open-source project. The application source code is published at{' '}
            <Link href="https://github.com/danny-avila/LibreChat">
              github.com/danny-avila/LibreChat
            </Link>{' '}
            under the MIT License. The Site itself is published at{' '}
            <Link href="https://github.com/LibreChat-AI/librechat.ai">
              github.com/LibreChat-AI/librechat.ai
            </Link>
            , and we welcome contributions through pull requests in accordance with that
            repository&apos;s contribution guidelines.
          </p>

          <h2>5. Use of Documentation Content</h2>
          <p>
            Unless otherwise noted on a specific page, the documentation content is made available
            under the same MIT License that governs the LibreChat application. Subject to that
            license, you may freely:
          </p>
          <ul>
            <li>Read, search, and download the documentation for personal or business purposes.</li>
            <li>Share links and excerpts of the documentation.</li>
            <li>
              Reproduce or adapt the documentation in your own materials, provided that the MIT
              License notice is preserved where the license requires it.
            </li>
            <li>
              Use the documentation to install, configure, operate, and customize your own instances
              of LibreChat.
            </li>
          </ul>
          <p>
            Trademarks, logos, and brand assets associated with the LibreChat project remain the
            property of their respective owners and are not licensed under the MIT License. Please
            do not use them in a manner that could imply endorsement or affiliation without our
            permission.
          </p>

          <h2>6. Acceptable Use</h2>
          <p>
            You agree to use the Site responsibly and in accordance with applicable law. In
            particular, you must not:
          </p>
          <ul>
            <li>
              Attempt to disrupt, degrade, or impair the Site, including by submitting excessive
              automated requests, conducting denial-of-service attacks, or probing for unauthorized
              access.
            </li>
            <li>
              Circumvent, disable, or otherwise interfere with security or rate-limiting features of
              the Site.
            </li>
            <li>
              Scrape, crawl, or otherwise extract content from the Site in a manner that materially
              burdens our infrastructure or violates the directives in our{' '}
              <Link href="/robots.txt">robots.txt</Link>. Reasonable, well-behaved crawlers (for
              example, search-engine and AI-training crawlers that respect <code>robots.txt</code>)
              are welcome.
            </li>
            <li>
              Use the Site to publish, transmit, or facilitate unlawful, harmful, defamatory, or
              infringing material.
            </li>
            <li>
              Misrepresent your identity or affiliation, or impersonate the LibreChat project or its
              maintainers.
            </li>
            <li>
              Use the Site in any way that violates export-control, sanctions, intellectual
              property, or data-protection laws.
            </li>
          </ul>

          <h2>7. Privacy and Analytics</h2>
          <p>
            Your privacy is governed by our <Link href="/privacy">Privacy Policy</Link> and{' '}
            <Link href="/cookie">Cookie Policy</Link>, which are incorporated into these Terms by
            reference. In summary, the Site does not set cookies, does not collect personal data for
            marketing, and uses only privacy-preserving, self-hosted analytics and performance
            measurements that cannot identify you. By using the Site you acknowledge the data
            handling described in those policies.
          </p>

          <h2>8. Third-Party Services and Links</h2>
          <p>
            The Site contains links and references to third-party services, software, and websites
            (for example, package registries, model providers, infrastructure vendors, and community
            forums). We are not responsible for the content, accuracy, availability, terms, or
            privacy practices of any third-party service, and your use of those services is governed
            by their own terms and policies.
          </p>

          <h2>9. User Contributions</h2>
          <p>
            If you submit a contribution to the Site &mdash; for example, a documentation pull
            request, an issue, or a comment &mdash; through the project&apos;s public repositories,
            you do so under the terms of the relevant repository&apos;s <code>LICENSE</code> file
            and contribution guidelines. You represent that you have the right to submit the
            contribution and grant the licenses required by those documents.
          </p>

          <h2>10. Intellectual Property</h2>
          <p>
            Except for content explicitly licensed under the MIT License or another license stated
            on the relevant page, all rights in and to the Site, including its design, arrangement,
            and selection of content, remain the property of the LibreChat project maintainers and
            their contributors. Nothing in these Terms transfers ownership of third-party
            intellectual property referenced in the documentation.
          </p>

          <h2>11. No Warranty</h2>
          <p>
            The Site and its content are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            without warranties of any kind, whether express, implied, or statutory. To the fullest
            extent permitted by applicable law, we disclaim all warranties, including warranties of
            merchantability, fitness for a particular purpose, non-infringement, accuracy,
            completeness, and uninterrupted or error-free operation. Documentation may contain
            technical inaccuracies or typographical errors and may be updated at any time without
            notice.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, in no event will the LibreChat
            project maintainers, contributors, or affiliates be liable for any indirect, incidental,
            special, consequential, exemplary, or punitive damages, or for any loss of profits,
            revenues, data, goodwill, or other intangible losses, arising out of or in connection
            with your access to, use of, or inability to use the Site, even if advised of the
            possibility of such damages. To the extent that liability cannot be excluded, our
            aggregate liability arising out of or relating to these Terms or the Site is limited to
            the greater of (a) the amount you paid us to use the Site (which is zero) and (b) USD
            one hundred (US&nbsp;$100).
          </p>
          <p>
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation or
            exclusion of liability for certain damages; in those jurisdictions the foregoing
            limitations apply only to the maximum extent permitted by law, and nothing in these
            Terms limits any rights you have that cannot be lawfully limited.
          </p>

          <h2>13. Indemnification</h2>
          <p>
            To the extent permitted by applicable law, you agree to indemnify and hold harmless the
            LibreChat project maintainers, contributors, and affiliates from and against any claims,
            damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees)
            arising out of your use of the Site in violation of these Terms or applicable law.
          </p>

          <h2>14. Availability and Changes to the Site</h2>
          <p>
            We may modify, suspend, relocate, or discontinue all or part of the Site at any time
            without notice. We are not liable for any unavailability of the Site or for the loss of
            any content or links resulting from such changes. Where reasonable, we will redirect
            content that has moved.
          </p>

          <h2>15. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time to reflect changes in the Site, in our
            practices, or in applicable law. Material changes will be reflected in the &ldquo;Last
            updated&rdquo; date at the top of this page and, where appropriate, communicated more
            prominently. Your continued use of the Site following any update constitutes your
            acceptance of the revised Terms.
          </p>

          <h2>16. Governing Law and Disputes</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which the LibreChat
            maintainers organize their operations, without regard to that jurisdiction&apos;s
            conflict-of-laws principles. Where you are a consumer protected by mandatory local law,
            those protections take precedence over this clause to the extent required.
          </p>
          <p>
            Before initiating any formal proceeding, the parties agree to attempt in good faith to
            resolve any dispute arising out of or relating to these Terms or the Site through
            informal communication, including by opening an issue in the project repository or by
            contacting us at the address below.
          </p>

          <h2>17. Severability and Entire Agreement</h2>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, that provision
            will be enforced to the maximum extent permissible and the remaining provisions will
            remain in full force and effect. These Terms, together with the{' '}
            <Link href="/privacy">Privacy Policy</Link> and the{' '}
            <Link href="/cookie">Cookie Policy</Link>, constitute the entire agreement between you
            and us regarding the Site and supersede any prior agreements on the same subject.
          </p>

          <h2>18. Contact</h2>
          <p>
            For questions about these Terms or about the LibreChat project, please contact us at{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link> or open an issue in
            the{' '}
            <Link href="https://github.com/LibreChat-AI/librechat.ai/issues">
              project repository
            </Link>
            .
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using this documentation site, you agree to these Terms of Service and to the
            policies they incorporate by reference.
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
