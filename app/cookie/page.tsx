import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How the LibreChat website and documentation use cookies, browser storage, and analytics.',
}

export default function CookiePolicyPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-8"
      >
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
          <header className="mb-12 not-prose text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cookie Policy
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: July 29, 2026</p>
          </header>

          <h2>1. Overview</h2>
          <p>
            The LibreChat website and documentation (
            <Link href="https://librechat.ai">librechat.ai</Link>, the &ldquo;Site&rdquo;) use a
            limited number of first-party cookies and browser-storage entries. Essential preference
            storage supports features you request. Optional Reo.dev performance analytics are
            disabled unless you affirmatively accept them.
          </p>
          <p>
            This policy supplements our <Link href="/privacy">Privacy Policy</Link> and does not
            apply to the self-hosted LibreChat application or the public Demo.
          </p>

          <h2>2. Essential Preference Storage</h2>
          <p>
            When you explicitly select a documentation language, the Site sets the first-party{' '}
            <code>NEXT_LOCALE</code> cookie for up to one year. It remembers that selection so
            browser-language detection does not override it on a later visit. This cookie is not
            used for analytics or advertising.
          </p>
          <p>
            The Site may also store theme, navigation, feedback, and similar interface preferences
            in <code>localStorage</code>. These values remain on your device and support features
            you choose to use.
          </p>

          <h2>3. Cookieless Analytics and Performance Monitoring</h2>
          <p>
            Our self-hosted Plausible analytics and Core Web Vitals monitoring do not set cookies or
            persistent identifiers. Their operation is described in the{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>4. Optional Reo.dev Performance Analytics</h2>
          <p>
            If configured by the Site operators, Reo.dev performance analytics help us understand
            website and documentation usage, including pages visited and interactions with technical
            content. The Reo.dev script is not requested and its cookies are not created until you
            select <strong>Accept performance analytics</strong>.
          </p>
          <p>According to Reo.dev, its script may create these first-party cookies:</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Maximum duration</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>__sec__cid</code>
                  </td>
                  <td>300 days</td>
                  <td>Stores the Reo.dev client key.</td>
                </tr>
                <tr>
                  <td>
                    <code>__sec__fid</code>
                  </td>
                  <td>300 days</td>
                  <td>Stores a generated identifier used to understand Site usage.</td>
                </tr>
                <tr>
                  <td>
                    <code>__sec__ghost</code>
                  </td>
                  <td>300 days</td>
                  <td>Combines Reo.dev identifiers to recognize a browser.</td>
                </tr>
                <tr>
                  <td>
                    <code>__sec__token</code>
                  </td>
                  <td>300 days</td>
                  <td>Stores a token used for requests to Reo.dev.</td>
                </tr>
                <tr>
                  <td>
                    <code>__sec__crid</code>
                  </td>
                  <td>300 days</td>
                  <td>Supports browser recognition confidence.</td>
                </tr>
                <tr>
                  <td>
                    <code>__sec__tid</code>
                  </td>
                  <td>300 days</td>
                  <td>Helps analyze returning Site visitors.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Reo.dev receives data over HTTPS at <code>api.reo.dev</code>. For more information, see{' '}
            <Link href="https://docs.reo.dev/reo.dev-javascript-cookies-and-consent-guide">
              Reo.dev&apos;s cookie and consent guide
            </Link>{' '}
            and its <Link href="https://www.reo.dev/customer-privacy-policy">privacy notice</Link>.
          </p>

          <h2>5. Your Consent Choice</h2>
          <p>
            Your choice is stored in <code>localStorage</code> under{' '}
            <code>librechat_reo_consent</code>. This prevents the Site from repeatedly asking for
            the same preference. On a first visit, Global Privacy Control or a browser Do Not Track
            signal is treated as a rejection of optional analytics.
          </p>
          <p>
            You can change your choice at any time with the <strong>Cookie preferences</strong>{' '}
            button shown on the Site. Withdrawing consent clears the Reo.dev cookies accessible to
            the Site and reloads the page so its analytics listeners are no longer active. Rejecting
            or withdrawing consent does not affect access to the Site.
          </p>
          <p>
            You can also clear Site data using your browser controls or block requests to{' '}
            <code>static.reo.dev</code> and <code>api.reo.dev</code>.
          </p>

          <h2>6. Third-Party Links</h2>
          <p>
            The Site links to third-party resources, package registries, video platforms, and
            community sites. Those services may set their own cookies when you visit them. Their
            practices are governed by their own privacy and cookie notices.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this policy when our storage or analytics practices change. Material
            changes will be reflected in the &ldquo;Last updated&rdquo; date and, when appropriate,
            communicated prominently before taking effect.
          </p>

          <h2>8. Contact</h2>
          <p>
            For questions about this Cookie Policy, contact{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link> or open an issue in
            the{' '}
            <Link href="https://github.com/LibreChat-AI/librechat.ai/issues">Site repository</Link>.
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
