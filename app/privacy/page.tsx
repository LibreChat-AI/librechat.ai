import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How the LibreChat documentation website (librechat.ai) collects, processes, and protects information about its visitors.',
}

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: July 29, 2026</p>
          </header>

          <h2>1. Overview</h2>
          <p>
            This Privacy Policy describes how the LibreChat documentation website (
            <Link href="https://librechat.ai">librechat.ai</Link>, the &ldquo;Site&rdquo;) handles
            information about its visitors. We use privacy-preserving, cookieless tools for
            aggregate analytics and performance monitoring. With your express consent, we may also
            load Reo.dev performance analytics, which uses first-party cookies to understand how
            developers use the website and documentation. We do not use advertising cookies or track
            your activity across unrelated websites.
          </p>
          <p>
            This policy applies to the documentation website only. It does not apply to the
            LibreChat application itself, which you self-host and operate, nor to the public Demo
            instance, which is governed by its own{' '}
            <Link href="/demo/privacy">Demo Privacy Policy</Link>.
          </p>

          <h2>2. Who We Are</h2>
          <p>
            For the purposes of data protection law (including the EU/UK General Data Protection
            Regulation and the California Consumer Privacy Act), the data controller is the
            LibreChat project maintainers. You can reach us at{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link> or via the{' '}
            <Link href="https://github.com/danny-avila/LibreChat">
              project repository on GitHub
            </Link>
            .
          </p>

          <h2>3. Information We Collect Automatically</h2>
          <p>
            When you visit the Site, our analytics and performance-monitoring tools may collect a
            limited set of technical signals. The specific collection depends on your optional
            analytics consent.
          </p>

          <h3>3.1 Aggregate Usage Analytics &mdash; Plausible Analytics</h3>
          <p>
            We operate a self-hosted instance of{' '}
            <Link href="https://plausible.io/data-policy">Plausible Analytics</Link> at{' '}
            <code>plausible.librechat.ai</code>. Plausible is a privacy-focused alternative to
            traditional web analytics. Specifically, Plausible:
          </p>
          <ul>
            <li>
              Does <strong>not</strong> set cookies and does <strong>not</strong> use{' '}
              <code>localStorage</code> or any other persistent client-side identifier.
            </li>
            <li>
              Does <strong>not</strong> retain or log IP addresses. IP addresses are processed
              transiently in memory only to derive an approximate country and to compute a one-way,
              daily-rotating hash used for visitor de-duplication; the IP itself is then discarded
              and never written to any database.
            </li>
            <li>
              Does <strong>not</strong> create persistent profiles, does not track users across
              websites, and does not share data with advertising networks or data brokers.
            </li>
          </ul>
          <p>The data points collected are limited to:</p>
          <ul>
            <li>
              The URL of the page you visit and the URL of the page that referred you (the HTTP{' '}
              <code>Referer</code> header).
            </li>
            <li>
              Coarse browser, operating-system, device-type, and screen-size information derived
              from the User-Agent header.
            </li>
            <li>An approximate country derived from your IP address at request time.</li>
            <li>
              Clicks on outbound links (links pointing to domains other than{' '}
              <code>librechat.ai</code>) and a small number of named events such as{' '}
              <code>card_click</code> and <code>link_click</code> that record interactions with
              navigation cards and document links.
            </li>
          </ul>
          <p>
            Because all of these signals are stored in aggregate without persistent identifiers, we
            cannot use them to identify you, contact you, or correlate your visits to this Site with
            your activity on any other site.
          </p>
          <p>
            The Plausible script and event requests are served from first-party paths on{' '}
            <code>librechat.ai</code> &mdash; specifically <code>librechat.ai/js/</code> for the
            script and <code>librechat.ai/api/e</code> for event ingestion &mdash; and proxied
            through a Cloudflare Worker that forwards them to our self-hosted Plausible instance at{' '}
            <code>plausible.librechat.ai</code>. Some browser blocklists match on the word
            &ldquo;plausible&rdquo; in a domain name and will block this self-hosted instance
            despite the fact that it never shares data with a third party. Serving the script and
            endpoint from <code>librechat.ai</code> directly avoids that false positive. No
            additional data is collected as a result of this proxying; it is purely network-level
            routing. You can opt out by blocking <code>librechat.ai/api/e</code> in your browser or
            disabling JavaScript on this Site.
          </p>

          <h3>3.2 Performance Monitoring &mdash; Core Web Vitals</h3>
          <p>
            When enabled by the Site operators, we collect anonymous Core Web Vitals measurements
            using the open-source{' '}
            <Link href="https://github.com/GoogleChrome/web-vitals">web-vitals</Link> library and a
            small LibreChat client-side collector that forwards them to a self-hosted ingestion
            endpoint. These measurements help us detect and fix performance regressions (slow page
            loads, layout shifts, sluggish interactions). Specifically:
          </p>
          <ul>
            <li>
              The metrics collected are the standard Web Vitals defined by Google&apos;s{' '}
              <Link href="https://github.com/GoogleChrome/web-vitals">web-vitals</Link> library:
              Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout
              Shift (CLS), First Contentful Paint (FCP), and Time to First Byte (TTFB).
            </li>
            <li>
              Each measurement is associated with a route template (for example,{' '}
              <code>/blog/[slug]</code>) and the concrete URL path you are viewing.
            </li>
            <li>
              A session identifier is generated in browser memory using{' '}
              <code>crypto.randomUUID()</code>, is <strong>rotated on every page navigation</strong>
              , and is <strong>never</strong> persisted to cookies, <code>localStorage</code>,{' '}
              <code>sessionStorage</code>, or any other browser storage. As a result, performance
              data cannot be linked across page views, sessions, or visits.
            </li>
            <li>
              Measurements may be sampled (a fraction of page views are measured) to reduce
              processing volume; named events (such as page views) are not sampled.
            </li>
          </ul>

          <h3>3.3 Developer-Intent Analytics &mdash; Reo.dev (optional)</h3>
          <p>
            If you accept performance analytics, the Site loads Reo.dev JavaScript from{' '}
            <code>static.reo.dev</code>. Reo.dev receives page views and technical-content
            interactions, together with technical signals such as your browser information, IP
            address, referring URL, and Reo.dev identifiers. Reo.dev uses these signals to associate
            activity across visits, analyze developer interest, and provide LibreChat with company
            and developer-intent insights.
          </p>
          <p>
            Reo.dev sets first-party identifiers with a maximum documented lifetime of 300 days. The
            script does not load unless you consent, and rejecting optional analytics does not
            affect the Site. You can withdraw consent at any time using the{' '}
            <strong>Cookie preferences</strong> button. Details about the cookies and controls are
            available in our <Link href="/cookie">Cookie Policy</Link>.
          </p>
          <p>
            Reo.dev acts as a service provider processing this information for LibreChat. Its
            broader service may enrich technical activity with company or professional information
            from customers, integrations, licensed vendors, and public sources. See the{' '}
            <Link href="https://www.reo.dev/customer-privacy-policy">
              Reo.dev customer privacy notice
            </Link>{' '}
            for details and Reo.dev&apos;s data-subject contact information.
          </p>

          <h3>3.4 Server Logs</h3>
          <p>
            Like virtually all web servers, the infrastructure that serves this Site generates
            short-lived operational logs that may include the requesting IP address, the requested
            URL, the HTTP status code, and the User-Agent string. These logs are retained only as
            long as is necessary for security, fraud prevention, and reliability investigations
            (typically days, not months) and are not used to build user profiles.
          </p>

          <h2>4. Information We Do Not Collect</h2>
          <p>The Site does not directly request or store:</p>
          <ul>
            <li>Account credentials (the Site has no user accounts and no login).</li>
            <li>Payment information.</li>
            <li>Precise GPS location or biometric data.</li>
            <li>The contents of any conversation, message, file, or document.</li>
            <li>Information about the contents of your activity on unrelated websites.</li>
          </ul>

          <h2>5. Why We Process This Information &mdash; Lawful Basis</h2>
          <p>
            Where the EU/UK GDPR applies, we rely on the following lawful bases under Article 6(1):
          </p>
          <ul>
            <li>
              <strong>Legitimate interests</strong> (Article 6(1)(f)) for the cookieless analytics,
              performance measurements, and short-lived operational logs described above. Our
              legitimate interest is to understand which pages of the documentation are useful, to
              identify broken navigation paths, to protect the Site from abuse, and to keep it fast
              and reliable. Because the data is minimized and is not shared for advertising, we have
              determined that this processing does not override your fundamental rights and
              freedoms.
            </li>
            <li>
              <strong>Consent</strong> (Article 6(1)(a)) for Reo.dev performance analytics and its
              first-party identifiers. You may decline or withdraw that consent without affecting
              access to the Site.
            </li>
          </ul>
          <p>
            We do not rely on consent for the cookieless analytics described above because they do
            not use cookies or equivalent persistent identifiers. Reo.dev is kept separate and does
            not load before your optional analytics choice is granted.
          </p>

          <h2>6. How Long We Keep Information</h2>
          <ul>
            <li>
              <strong>Aggregate analytics</strong> (Plausible): retained indefinitely as
              non-identifying counts, time series, and aggregations. These records cannot be tied
              back to you.
            </li>
            <li>
              <strong>Performance metrics</strong> (CWV): retained for as long as is useful for
              detecting performance regressions, typically no more than 13 months. Measurements are
              not linked to any persistent identifier.
            </li>
            <li>
              <strong>Reo.dev analytics</strong>: Reo.dev identifiers may remain on your device for
              up to 300 days unless you withdraw consent or clear Site data. Server-side information
              is retained according to LibreChat&apos;s service configuration and Reo.dev&apos;s
              contractual and legal retention requirements.
            </li>
            <li>
              <strong>Operational server logs</strong>: retained for the minimum period required for
              security and reliability operations, after which they are automatically rotated and
              deleted.
            </li>
          </ul>

          <h2>7. International Data Transfers</h2>
          <p>
            Our self-hosted analytics ingestion endpoints are controlled by the project maintainers.
            Reo.dev states that user information is stored on servers in the United States. Where
            applicable, international transfers must be supported by legally recognized safeguards
            and the rights described below remain available.
          </p>

          <h2>8. Sub-Processors and Third Parties</h2>
          <p>The Site relies on the following service providers to operate:</p>
          <ul>
            <li>
              <strong>Hosting and content delivery</strong> for serving the documentation pages.
            </li>
            <li>
              <strong>Self-hosted Plausible Analytics</strong> at{' '}
              <code>plausible.librechat.ai</code>, operated by the LibreChat maintainers.
            </li>
            <li>
              <strong>Self-hosted Core Web Vitals ingestion</strong>, operated by the LibreChat
              maintainers, when performance monitoring is enabled.
            </li>
            <li>
              <strong>Reo.dev</strong> (
              <Link href="https://www.reo.dev/customer-privacy-policy">privacy notice</Link>) for
              consent-based website and documentation analytics, when enabled.
            </li>
          </ul>
          <p>
            We do not sell personal information or use Reo.dev for cross-context behavioral
            advertising. Reo.dev processes consented analytics information to provide its
            developer-intent service to LibreChat.
          </p>

          <h2>9. Your Rights</h2>
          <p>
            Subject to applicable law, you may have the following rights with respect to information
            about you:
          </p>
          <ul>
            <li>
              The right to <strong>access</strong> personal data we hold about you, to{' '}
              <strong>rectify</strong> inaccuracies, to request <strong>erasure</strong>, to{' '}
              <strong>restrict</strong> or <strong>object</strong> to processing, and to{' '}
              <strong>data portability</strong> (EU/UK GDPR).
            </li>
            <li>
              The right to <strong>know</strong> what personal information has been collected, the
              right to <strong>delete</strong> personal information, the right to{' '}
              <strong>correct</strong> inaccurate personal information, the right to{' '}
              <strong>opt out</strong> of the sale or sharing of personal information, and the right
              to <strong>non-discrimination</strong> (California CCPA/CPRA).
            </li>
            <li>
              The right to <strong>withdraw consent</strong> at any time where processing relies on
              consent.
            </li>
            <li>
              The right to <strong>lodge a complaint</strong> with your local data-protection
              supervisory authority.
            </li>
          </ul>
          <p>
            Cookieless aggregate records generally cannot be linked back to an individual. Reo.dev
            records may use persistent identifiers and may be associated with company or
            professional information. If you would like to exercise your rights, contact us at{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link> with enough detail
            for us to investigate. You may also contact Reo.dev at{' '}
            <Link href="mailto:dataprivacy@reo.dev">dataprivacy@reo.dev</Link>.
          </p>

          <h2>10. Browser Controls and Opt-Out</h2>
          <p>You can limit analytics collection at any time by:</p>
          <ul>
            <li>
              Enabling <strong>Do Not Track</strong> or <strong>Global Privacy Control</strong> in
              your browser. On a first visit, either signal is treated as a rejection of optional
              Reo.dev analytics.
            </li>
            <li>
              Opening <strong>Cookie preferences</strong> to reject or withdraw consent for Reo.dev.
            </li>
            <li>
              Using a content blocker, browser rule, or privacy-focused extension to block requests
              to the first-party analytics paths <code>librechat.ai/js/</code> and{' '}
              <code>librechat.ai/api/e</code>, the performance ingestion endpoint,{' '}
              <code>static.reo.dev</code>, or <code>api.reo.dev</code>.
            </li>
            <li>Disabling JavaScript for this Site, in which case no analytics will be sent.</li>
          </ul>

          <h2>11. Local Browser Storage</h2>
          <p>
            The Site stores small amounts of information in your browser for usability purposes,
            including theme and navigation preferences, an explicit language choice, and your
            optional-analytics consent choice. Preference values stay on your device and can be
            cleared through your browser&apos;s site-data controls. See the{' '}
            <Link href="/cookie">Cookie Policy</Link> for names and durations.
          </p>

          <h2>12. Children&apos;s Privacy</h2>
          <p>
            The Site is intended for software developers, IT administrators, and other professional
            users and is not directed at children under 16. We do not knowingly collect information
            from children. If you believe a child has provided personal information to us, please
            contact us and we will take appropriate action.
          </p>

          <h2>13. Security</h2>
          <p>
            We apply industry-standard administrative, technical, and physical safeguards to the
            limited data we process. The Site is served over HTTPS, uses security headers including
            a Content Security Policy, and is supported by automated dependency monitoring. No
            internet transmission or electronic storage is perfectly secure, but we work to reduce
            risk in line with reasonable industry practice.
          </p>

          <h2>14. External Links</h2>
          <p>
            The Site contains links to third-party resources, including the LibreChat GitHub
            repository, package registries, third-party documentation, community forums, and the
            websites of integration partners. We are not responsible for the privacy practices of
            those third parties; please review their privacy notices when you visit them.
          </p>

          <h2>15. Open-Source Project</h2>
          <p>
            LibreChat is open-source software licensed under the MIT License. The source code for
            the Site itself, including the analytics integration described above, is publicly
            auditable on <Link href="https://github.com/LibreChat-AI/librechat.ai">GitHub</Link>. We
            welcome independent review and pull requests that further improve visitor privacy.
          </p>

          <h2>16. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in technology,
            applicable law, or our operational practices. When we make material changes, we will
            update the &ldquo;Last updated&rdquo; date at the top of this page and, where
            appropriate, draw additional attention to the change. Your continued use of the Site
            following any update constitutes acceptance of the revised policy.
          </p>

          <h2>17. Contact</h2>
          <p>
            For questions or requests related to this Privacy Policy, including requests to exercise
            your rights, please contact us at{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link> or open an issue in
            the{' '}
            <Link href="https://github.com/LibreChat-AI/librechat.ai/issues">
              project repository
            </Link>
            .
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using this documentation site, you acknowledge that you have read and understood this
            Privacy Policy. The technical implementation of every analytics signal described above
            is publicly visible in the Site&apos;s source code.
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
