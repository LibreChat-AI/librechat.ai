import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LibreChat Demo',
  description: 'Privacy Policy for the LibreChat Demo instance at chat.librechat.ai.',
}

export default function DemoPrivacyPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
          <header className="mb-12 not-prose text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              LibreChat Demo
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Effective Date: March 12, 2026 &middot; Last Updated: March 12, 2026
            </p>
          </header>

          <p>
            This Privacy Policy explains how the LibreChat Project, maintained by Danny Avila
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), collects, uses, stores, and
            protects your personal data when you use the LibreChat Demo (&ldquo;Demo&rdquo;,
            &ldquo;Service&rdquo;), accessible at{' '}
            <Link href="https://chat.librechat.ai">chat.librechat.ai</Link>. We are committed to
            protecting your privacy and processing your data in accordance with Regulation (EU)
            2016/679 (the General Data Protection Regulation, &ldquo;GDPR&rdquo;) and other
            applicable data protection laws.
          </p>

          <h2>1. Data Controller</h2>
          <p>The data controller for this Service is:</p>
          <p>
            <strong>The LibreChat Project</strong>
            <br />
            Maintained by: Danny Avila
            <br />
            Email: <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link>
            <br />
            GitHub:{' '}
            <Link href="https://github.com/danny-avila/LibreChat">
              github.com/danny-avila/LibreChat
            </Link>
          </p>
          <p>
            If you have questions or concerns about how your data is handled, you may contact us at
            the address above.
          </p>

          <h2>2. What Data We Collect</h2>

          <h3>2.1 Account Data</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>
              <strong>Email address</strong> — provided directly by you during registration or
              obtained via a social login provider.
            </li>
            <li>
              <strong>Display name</strong> — provided by you or obtained from your social login
              profile.
            </li>
            <li>
              <strong>Avatar image</strong> — obtained from your social login provider, if
              applicable.
            </li>
            <li>
              <strong>Authentication identifiers</strong> — such as your Google or GitHub user ID,
              if you use social login.
            </li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <p>When you use the Service, we process:</p>
          <ul>
            <li>
              <strong>Conversation messages</strong> — the text you submit to the AI and the
              AI-generated responses.
            </li>
            <li>
              <strong>Uploaded files</strong> — any files you attach to conversations (documents,
              images, etc.).
            </li>
            <li>
              <strong>Technical metadata</strong> — including your IP address, browser user agent,
              timestamps of requests, and session identifiers.
            </li>
          </ul>

          <h3>2.3 Data We Do Not Collect</h3>
          <ul>
            <li>We do not use analytics services or third-party tracking tools on the Demo.</li>
            <li>We do not use advertising cookies or tracking pixels.</li>
            <li>We do not collect payment information (the Demo is free).</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>
            We process your personal data for the following purposes and on the following legal
            bases:
          </p>

          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">Purpose</th>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">
                    Data Involved
                  </th>
                  <th className="py-3 text-left font-semibold text-foreground">
                    Legal Basis (GDPR Art. 6)
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">
                    Providing the Service (account creation, authentication, AI chat functionality)
                  </td>
                  <td className="py-3 pr-4">Account data, conversation messages, uploaded files</td>
                  <td className="py-3">Performance of contract (Art. 6(1)(b))</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">
                    Maintaining security and preventing abuse (rate limiting, ban enforcement, fraud
                    detection)
                  </td>
                  <td className="py-3 pr-4">IP address, user agent, usage patterns</td>
                  <td className="py-3">Legitimate interest (Art. 6(1)(f))</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">
                    Complying with legal obligations (responding to lawful requests, DSA compliance)
                  </td>
                  <td className="py-3 pr-4">Account data, content data, technical metadata</td>
                  <td className="py-3">Legal obligation (Art. 6(1)(c))</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">Improving and debugging the Service</td>
                  <td className="py-3 pr-4">Aggregated, anonymized usage statistics</td>
                  <td className="py-3">Legitimate interest (Art. 6(1)(f))</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            We do not use your data for profiling, automated decision-making, or direct marketing.
          </p>

          <h2>4. Third-Party AI Model Providers</h2>
          <p>
            The Demo connects to third-party AI model providers (such as OpenAI, Anthropic, Google,
            and others) to process your conversation messages. When you send a message, the text of
            your message (and any attached files, where supported) is transmitted to the selected AI
            provider for processing.
          </p>
          <p>
            Each AI provider processes your data in accordance with their own privacy policies and
            terms. We encourage you to review the privacy policies of the AI providers you use
            through the Service. We are not responsible for the data practices of third-party AI
            providers.
          </p>

          <h2>5. Third-Party Authentication Providers</h2>
          <p>
            If you use social login (such as Google or GitHub), the authentication provider may
            share your name, email address, and profile picture with us in accordance with the
            permissions you grant during the login process. We receive only the data necessary for
            account creation and do not access your contacts, files, or other account data from
            those providers.
          </p>

          <h2>6. Data Sharing and Sub-Processors</h2>
          <p>
            We do not sell, rent, or trade your personal data. We share your data only with the
            following categories of recipients, and only to the extent necessary:
          </p>
          <ul>
            <li>
              <strong>Hosting provider</strong> — Hetzner Online GmbH (Gunzenhausen, Germany).
              Servers are located in the EU (Falkenstein, Germany).
            </li>
            <li>
              <strong>AI model providers</strong> — as described in Section 4, your conversation
              data is transmitted to the AI provider selected for each interaction.
            </li>
            <li>
              <strong>Social login providers</strong> — Google LLC, GitHub Inc., as applicable, for
              authentication purposes only.
            </li>
            <li>
              <strong>Law enforcement or regulatory authorities</strong> — where required by law,
              court order, or binding regulatory request.
            </li>
          </ul>
          <p>
            All sub-processors that handle personal data on our behalf are contractually bound to
            process your data only on our instructions and to implement appropriate technical and
            organizational security measures.
          </p>

          <h2>7. International Data Transfers</h2>
          <p>
            Your data is primarily stored on servers located in the European Union (Germany).
            However, when you use AI model providers whose servers are located outside the EU (such
            as in the United States), your conversation data is transferred to those jurisdictions.
          </p>
          <p>Where personal data is transferred outside the EU/EEA, we rely on:</p>
          <ul>
            <li>The European Commission&apos;s adequacy decisions, where available.</li>
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission.</li>
            <li>Other appropriate safeguards as required by the GDPR.</li>
          </ul>

          <h2>8. Data Retention</h2>
          <p>We retain your data for the following periods:</p>

          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">Data Type</th>
                  <th className="py-3 text-left font-semibold text-foreground">Retention Period</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">Account data (email, name, avatar)</td>
                  <td className="py-3">
                    Until you delete your account, or until we perform periodic Demo cleanups
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">Conversation messages</td>
                  <td className="py-3">
                    Until you delete them, until your account is deleted, or until periodic Demo
                    cleanups
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">Uploaded files</td>
                  <td className="py-3">Up to 30 days, subject to automatic deletion</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">Technical logs (IP, user agent)</td>
                  <td className="py-3">Up to 30 days</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4">Rate limiting and ban records</td>
                  <td className="py-3">Up to 90 days</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            As this is a demonstration service, we may perform periodic database cleanups that
            result in the deletion of all user data. We do not guarantee long-term persistence of
            any data on the Demo.
          </p>

          <h2>9. Your Rights Under the GDPR</h2>
          <p>
            If you are located in the European Economic Area (EEA), you have the following rights
            regarding your personal data:
          </p>
          <ul>
            <li>
              <strong>Right of Access</strong> (Art. 15) — You may request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Right to Rectification</strong> (Art. 16) — You may request that we correct
              inaccurate or incomplete data.
            </li>
            <li>
              <strong>Right to Erasure</strong> (Art. 17) — You may request that we delete your
              personal data (&ldquo;right to be forgotten&rdquo;).
            </li>
            <li>
              <strong>Right to Restriction of Processing</strong> (Art. 18) — You may request that
              we restrict the processing of your data in certain circumstances.
            </li>
            <li>
              <strong>Right to Data Portability</strong> (Art. 20) — You may request to receive your
              data in a structured, commonly used, machine-readable format.
            </li>
            <li>
              <strong>Right to Object</strong> (Art. 21) — You may object to processing based on
              legitimate interests.
            </li>
            <li>
              <strong>Right to Lodge a Complaint</strong> — You have the right to lodge a complaint
              with a supervisory authority. If you are located in Italy, the competent authority is
              the Garante per la protezione dei dati personali (
              <Link href="https://www.garanteprivacy.it">garanteprivacy.it</Link>).
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{' '}
            <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link>. We will respond
            within 30 days.
          </p>

          <h2>10. Cookies and Local Storage</h2>
          <p>
            The Demo uses only <strong>strictly necessary cookies</strong> for:
          </p>
          <ul>
            <li>Session management (maintaining your login state).</li>
            <li>Security (CSRF protection tokens).</li>
          </ul>
          <p>
            We do not use analytics cookies, advertising cookies, or any form of cross-site
            tracking. No cookie consent banner is required as we rely solely on cookies that are
            exempt under Article 5(3) of the ePrivacy Directive (Directive 2002/58/EC) because they
            are strictly necessary for the provision of the Service.
          </p>

          <h2>11. Security Measures</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            data, including:
          </p>
          <ul>
            <li>Encryption in transit (TLS/HTTPS for all connections).</li>
            <li>Access controls and authentication for server infrastructure.</li>
            <li>Regular security updates and monitoring.</li>
            <li>Firewall rules restricting access to internal services.</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100%
            secure. We cannot guarantee absolute security and are not liable for breaches resulting
            from circumstances beyond our reasonable control.
          </p>

          <h2>12. Data Breach Notification</h2>
          <p>
            In the event of a personal data breach that is likely to result in a risk to your rights
            and freedoms, we will:
          </p>
          <ul>
            <li>
              Notify the competent supervisory authority within 72 hours of becoming aware of the
              breach, as required by GDPR Art. 33.
            </li>
            <li>
              Notify affected users without undue delay where the breach is likely to result in a
              high risk to their rights and freedoms, as required by GDPR Art. 34.
            </li>
          </ul>

          <h2>13. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed at children under the age of 16. We do not knowingly collect
            personal data from children under 16. If we become aware that we have collected personal
            data from a child under 16, we will take steps to delete that data promptly. If you
            believe a child under 16 has provided us with personal data, please contact us at the
            address in Section 1.
          </p>

          <h2>14. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be
            communicated through the Service interface. Your continued use of the Service after the
            effective date of any changes constitutes your acceptance of the updated Privacy Policy.
          </p>

          <h2>15. Contact Us</h2>
          <p>
            For any privacy-related questions, data subject requests, or concerns, please contact:
          </p>
          <p>
            <strong>The LibreChat Project</strong>
            <br />
            Maintained by: Danny Avila
            <br />
            Email: <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link>
            <br />
            GitHub:{' '}
            <Link href="https://github.com/danny-avila/LibreChat">
              github.com/danny-avila/LibreChat
            </Link>
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using the LibreChat Demo, you acknowledge that your data is processed as described in
            this Privacy Policy.
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
