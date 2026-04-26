import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How the LibreChat documentation website handles cookies, browser storage, and cookieless analytics.',
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
            <p className="mt-4 text-sm text-muted-foreground">Last updated: April 26, 2026</p>
          </header>

          <h2>1. Overview</h2>
          <p>
            The LibreChat documentation website (
            <Link href="https://librechat.ai">librechat.ai</Link>, the &ldquo;Site&rdquo;) does{' '}
            <strong>not use cookies</strong>. This Cookie Policy describes the small amount of
            client-side storage we do use, explains how our analytics operate without cookies, and
            describes the controls available to you. It supplements our{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <h2>2. We Do Not Use Cookies</h2>
          <p>
            The Site does not set any cookies on your device, and we do not read cookies set by
            other websites. Specifically, we do not use:
          </p>
          <ul>
            <li>Authentication cookies (the Site has no user accounts and no login).</li>
            <li>Advertising or marketing cookies.</li>
            <li>Cross-site tracking cookies.</li>
            <li>Third-party social-network cookies.</li>
            <li>Personalization or preference cookies set by us.</li>
          </ul>
          <p>
            Because we do not use cookies or any equivalent device-storage identifier within the
            meaning of the EU ePrivacy Directive, we do not display a cookie banner and do not
            require your consent for cookies.
          </p>

          <h2>3. How Our Analytics Work Without Cookies</h2>
          <p>
            We operate cookieless analytics and performance tooling. Both are described in detail in
            our <Link href="/privacy">Privacy Policy</Link>; the points most relevant to cookies and
            device storage are summarized here.
          </p>

          <h3>3.1 Plausible Analytics</h3>
          <p>
            We host an instance of <Link href="https://plausible.io/data-policy">Plausible</Link> at{' '}
            <code>analytics.librechat.ai</code>. Plausible:
          </p>
          <ul>
            <li>
              Does <strong>not</strong> set cookies.
            </li>
            <li>
              Does <strong>not</strong> use <code>localStorage</code> or <code>sessionStorage</code>
              .
            </li>
            <li>
              Does <strong>not</strong> use any other persistent client-side identifier such as
              IndexedDB, ETags, or browser fingerprinting techniques.
            </li>
          </ul>
          <p>
            Visitor de-duplication is achieved on the server side using a one-way, daily-rotating
            hash that combines a salt with the IP address and User-Agent. The salt rotates every
            twenty-four hours and the IP address itself is never written to disk, which means the
            hash cannot be linked across days and cannot be reversed back to a person or a device.
          </p>

          <h3>3.2 Core Web Vitals Monitoring</h3>
          <p>
            When performance monitoring is enabled, we collect anonymous Web Vitals measurements
            using the open-source{' '}
            <Link href="https://github.com/Blazity/next-cwv-monitor">next-cwv-monitor</Link> SDK.
            This tool:
          </p>
          <ul>
            <li>
              Does <strong>not</strong> set cookies.
            </li>
            <li>
              Does <strong>not</strong> use <code>localStorage</code> or <code>sessionStorage</code>
              .
            </li>
            <li>
              Generates a session identifier in browser memory using{' '}
              <code>crypto.randomUUID()</code> and{' '}
              <strong>rotates it on every page navigation</strong>, so measurements cannot be
              correlated across page views or visits.
            </li>
          </ul>

          <h2>4. Local Browser Storage We Do Use</h2>
          <p>
            For your convenience, the Site itself may write a small amount of non-identifying
            information to your browser&apos;s <code>localStorage</code>. This data:
          </p>
          <ul>
            <li>Is stored only on your device.</li>
            <li>Is never transmitted to our servers or to any third party.</li>
            <li>Does not identify you and is not combined with any other information.</li>
            <li>Can be cleared at any time using your browser&apos;s site-data controls.</li>
          </ul>
          <p>The keys we may set include:</p>
          <ul>
            <li>
              <strong>Theme preference</strong>: whether you have selected light or dark mode.
            </li>
            <li>
              <strong>Navigation state</strong>: the open/closed state of collapsible documentation
              sections so the layout is preserved as you browse.
            </li>
          </ul>

          <h2>5. Third-Party Links and Embedded Content</h2>
          <p>
            The documentation links to a number of third-party resources, including the LibreChat
            GitHub repository, package registries, integration partner sites, video platforms, and
            community forums. Some of those third parties may set their own cookies when you visit
            them. We do not control, and are not responsible for, the cookies or storage practices
            of external sites; please review their cookie policies directly.
          </p>
          <p>
            Where we conditionally load a small transparent pixel from{' '}
            <Link href="https://about.scarf.sh/privacy">Scarf</Link> (<code>static.scarf.sh</code>)
            for anonymous package-pull telemetry, that pixel does not set cookies and does not use{' '}
            <code>localStorage</code>.
          </p>

          <h2>6. Your Choices and Controls</h2>
          <p>
            You can further restrict the limited information described in this policy at any time
            by:
          </p>
          <ul>
            <li>
              Configuring your browser to block third-party requests, to clear site data on close,
              or to deny <code>localStorage</code> access for this Site.
            </li>
            <li>
              Enabling <strong>Do Not Track</strong>, <strong>Global Privacy Control</strong>, or
              tracker-blocking features in your browser.
            </li>
            <li>
              Installing a content-blocking extension that blocks requests to{' '}
              <code>analytics.librechat.ai</code> and any performance-monitoring endpoint we
              configure.
            </li>
            <li>Disabling JavaScript, in which case no analytics or performance data is sent.</li>
          </ul>
          <p>
            Because we do not rely on cookies or persistent identifiers, exercising any of these
            controls will not break the documentation experience.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our tooling or
            in applicable law. Material changes will be reflected in the &ldquo;Last updated&rdquo;
            date at the top of this page. We do not anticipate adding cookies to the Site, and any
            change in that posture would be communicated prominently before being deployed.
          </p>

          <h2>8. Contact</h2>
          <p>
            For questions about this Cookie Policy, please contact us at{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link> or open an issue in
            the{' '}
            <Link href="https://github.com/LibreChat-AI/librechat.ai/issues">
              project repository
            </Link>
            .
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using this documentation site, you acknowledge that no cookies are set and that the
            cookieless analytics described above operate as part of normal Site operation.
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
