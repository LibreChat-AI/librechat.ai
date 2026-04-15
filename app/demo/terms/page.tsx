import Link from 'next/link'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/app/layout.config'
import FooterMenu from '@/components/FooterMenu'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — LibreChat Demo',
  description: 'Terms of Service for the LibreChat Demo instance at chat.librechat.ai.',
}

export default function DemoTermsPage() {
  return (
    <HomeLayout {...baseOptions}>
      <main className="min-h-screen px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
          <header className="mb-12 not-prose text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              LibreChat Demo
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Effective Date: March 12, 2026 &middot; Last Updated: March 12, 2026
            </p>
          </header>

          <p>
            Welcome to the LibreChat Demo (&ldquo;Demo&rdquo;, &ldquo;Service&rdquo;), a free
            demonstration instance of the open-source LibreChat platform operated by the LibreChat
            Project, maintained by Danny Avila (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
            &ldquo;our&rdquo;). The Demo is accessible at{' '}
            <Link href="https://chat.librechat.ai">chat.librechat.ai</Link>.
          </p>

          <p>
            By creating an account or using this Service, you agree to be bound by these Terms of
            Service (&ldquo;Terms&rdquo;) and our <Link href="/demo/privacy">Privacy Policy</Link>.
            If you do not agree to these Terms, do not use the Service.
          </p>

          <h2>1. Nature of the Service</h2>
          <p>
            The Demo is a <strong>free, public demonstration</strong> of the LibreChat open-source
            software. It is provided for evaluation, testing, and educational purposes only. The
            Demo is not intended for production use, commercial deployment, or the processing of
            sensitive, confidential, or regulated data.
          </p>
          <p>
            We make no guarantees regarding availability, uptime, performance, or continuity of the
            Service. The Demo may be modified, suspended, or discontinued at any time without prior
            notice.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 16 years of age to use this Service. By using the Service, you
            represent and warrant that you meet this age requirement. If you are between 16 and 18
            years of age, you represent that you have reviewed these Terms with a parent or legal
            guardian and that they consent to your use of the Service.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To access the Service, you may be required to create an account using an email address
            or through a third-party social login provider (such as Google or GitHub). You agree to
            provide accurate information during registration and to keep your credentials secure.
            You are solely responsible for all activity that occurs under your account.
          </p>
          <p>
            We reserve the right to suspend or terminate any account at our sole discretion, with or
            without cause, and with or without notice.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>
            You agree to use the Service only for lawful purposes. The following activities are
            strictly prohibited:
          </p>
          <ul>
            <li>
              Submitting, uploading, or generating content that is illegal, defamatory, obscene,
              threatening, abusive, hateful, discriminatory, or that incites violence.
            </li>
            <li>
              Uploading content that infringes on the intellectual property rights, privacy rights,
              or other rights of any third party.
            </li>
            <li>
              Uploading content that depicts, promotes, or facilitates the sexual exploitation or
              abuse of minors (CSAM). Any such content will be immediately removed and reported to
              the relevant authorities.
            </li>
            <li>Using the Service to harass, stalk, impersonate, or intimidate any person.</li>
            <li>
              Attempting to gain unauthorized access to the Service, other user accounts, or any
              systems or networks connected to the Service.
            </li>
            <li>
              Using automated tools (bots, scrapers, crawlers) to access the Service without our
              prior written consent.
            </li>
            <li>Circumventing rate limits, usage restrictions, or security measures.</li>
            <li>
              Using the Service to develop, train, or improve competing AI products or services
              without our prior written consent.
            </li>
            <li>
              Engaging in any activity that disrupts, degrades, or interferes with the Service or
              the experience of other users.
            </li>
            <li>
              Using the Service for any high-risk, safety-critical, or regulated purpose, including
              but not limited to medical diagnosis, legal advice, financial trading, or autonomous
              vehicle operation.
            </li>
          </ul>

          <h2>5. User-Generated Content</h2>

          <h3>5.1 Your Content</h3>
          <p>
            &ldquo;User Content&rdquo; means any text, files, images, or other material you submit,
            upload, or input to the Service, including conversation messages and file attachments.
            You retain ownership of your User Content.
          </p>
          <p>
            By submitting User Content, you grant us a limited, non-exclusive, royalty-free,
            worldwide license to store, process, and transmit your content solely for the purpose of
            operating the Service. This license terminates when your content is deleted from the
            Service.
          </p>

          <h3>5.2 Content Responsibility</h3>
          <p>
            You are solely responsible for your User Content. We do not pre-screen, monitor, or
            endorse User Content. We act as a passive hosting provider and do not exercise editorial
            control over content submitted by users.
          </p>

          <h3>5.3 Content Removal and Reporting</h3>
          <p>
            In accordance with Regulation (EU) 2022/2065 (the Digital Services Act,
            &ldquo;DSA&rdquo;), we provide mechanisms for reporting illegal content. If you believe
            any content on the Service is illegal or violates these Terms, you may report it by
            contacting us at the address specified in Section 14.
          </p>
          <p>
            Upon receiving a valid notice of illegal content, we will act expeditiously to assess
            the report and, where appropriate, remove or disable access to the content in question.
            We will inform the reporting party and, where feasible, the content uploader of any
            action taken and the reasons for it.
          </p>

          <h3>5.4 Repeat Infringers</h3>
          <p>
            We reserve the right to suspend or terminate the accounts of users who repeatedly
            violate these Terms or who are the subject of repeated valid reports of illegal content.
          </p>

          <h2>6. AI-Generated Output</h2>
          <p>
            The Service provides access to third-party artificial intelligence models. AI-generated
            output (&ldquo;AI Output&rdquo;) may be inaccurate, incomplete, biased, or otherwise
            unreliable. You acknowledge and agree that:
          </p>
          <ul>
            <li>
              AI Output does not constitute professional advice of any kind (legal, medical,
              financial, or otherwise).
            </li>
            <li>You are solely responsible for evaluating and using AI Output.</li>
            <li>
              We do not guarantee the accuracy, reliability, completeness, or fitness for any
              particular purpose of AI Output.
            </li>
            <li>
              AI Output may be subject to the terms and conditions of the underlying AI model
              providers.
            </li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>
            The LibreChat software is open-source and licensed under the MIT License. These Terms do
            not grant you any additional rights to the LibreChat trademark, logo, or brand assets
            beyond what the MIT License permits.
          </p>
          <p>
            Third-party AI model providers retain all rights to their respective models, and use of
            those models through the Service is subject to their terms of service.
          </p>

          <h2>8. Data Retention and Deletion</h2>
          <p>As this is a demonstration service:</p>
          <ul>
            <li>
              Conversation data, uploaded files, and account information may be deleted at any time
              without prior notice.
            </li>
            <li>
              We may implement automatic data retention limits. Currently, uploaded files may be
              retained for up to 30 days before automatic deletion.
            </li>
            <li>
              Account data is retained while your account is active. Upon account deletion, we will
              remove your personal data within 30 days, subject to any legal obligations requiring
              longer retention.
            </li>
            <li>
              We perform periodic cleanups of the Demo database. Your conversations and data may not
              persist indefinitely.
            </li>
          </ul>
          <p>
            For details on what data we collect and how we process it, see our{' '}
            <Link href="/demo/privacy">Privacy Policy</Link>.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p className="uppercase text-sm">
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, whether express, implied, or statutory, including but not
            limited to implied warranties of merchantability, fitness for a particular purpose,
            non-infringement, and accuracy.
          </p>
          <p className="uppercase text-sm">
            We do not warrant that the Service will be uninterrupted, secure, error-free, or free of
            viruses or other harmful components. We do not warrant that AI Output will be accurate,
            complete, or reliable.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p className="uppercase text-sm">
            To the maximum extent permitted by applicable law, in no event shall we, our officers,
            directors, employees, affiliates, or contributors be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits, data,
            use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="uppercase text-sm">
            <li>Your use of or inability to use the Service;</li>
            <li>Any AI Output or User Content accessed through the Service;</li>
            <li>Unauthorized access to or alteration of your data;</li>
            <li>Any third-party conduct on the Service;</li>
            <li>Any other matter relating to the Service.</li>
          </ul>
          <p className="uppercase text-sm">
            Our total aggregate liability for all claims arising out of or relating to these Terms
            or the Service shall not exceed EUR 100.
          </p>
          <p>
            Nothing in these Terms excludes or limits liability for death or personal injury caused
            by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot
            be excluded or limited by applicable law.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless the LibreChat Project, Danny Avila,
            and its contributors from and against any claims, liabilities, damages, losses, costs,
            or expenses (including reasonable legal fees) arising out of or in connection with your
            use of the Service, your User Content, or your violation of these Terms.
          </p>

          <h2>12. Modifications to the Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Material changes will be
            communicated through the Service interface (for example, by requiring re-acceptance of
            updated Terms). Your continued use of the Service after the effective date of any
            changes constitutes your acceptance of the updated Terms.
          </p>

          <h2>13. Governing Law and Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State
            of Delaware, United States, without regard to its conflict of law provisions, and where
            applicable, the mandatory consumer protection laws of the European Union.
          </p>
          <p>
            If you are a consumer habitually resident in the European Union, you shall benefit from
            any mandatory provisions of the law of your country of residence. Nothing in these Terms
            affects your rights as a consumer under applicable EU law, including Regulation (EU)
            2022/2065 (Digital Services Act).
          </p>
          <p>
            For EU-based users, disputes may be submitted to the Online Dispute Resolution platform
            provided by the European Commission at{' '}
            <Link href="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</Link>.
          </p>

          <h2>14. Contact Information</h2>
          <p>
            For questions about these Terms, to report illegal content, or to submit a DSA-compliant
            notice, please contact us at:
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

          <h2>15. Severability</h2>
          <p>
            If any provision of these Terms is held to be invalid or unenforceable, the remaining
            provisions shall continue in full force and effect. The invalid or unenforceable
            provision shall be modified to the minimum extent necessary to make it valid and
            enforceable.
          </p>

          <h2>16. Entire Agreement</h2>
          <p>
            These Terms, together with our <Link href="/demo/privacy">Privacy Policy</Link>,
            constitute the entire agreement between you and us regarding your use of the Service and
            supersede any prior agreements.
          </p>

          <hr />

          <p className="text-sm text-muted-foreground">
            By using the LibreChat Demo, you agree to these Terms of Service.
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
