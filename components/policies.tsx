import { Link } from 'nextra-theme-docs'
import { Button } from 'nextra/components'

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <h1 className="text-3xl font-extrabold pb-6">Privacy Policy for LibreChat</h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Effective Date: February 18, 2024

This Privacy Policy outlines the types of personal information that is received and collected by LibreChat`}{' '}
          <Link href="https://librechat.ai">https://librechat.ai</Link>
          {` and how it is used.

1. Information Collection

We collect personal information when you interact with our site, including your name, email address, and payment information. This information is used for order processing and to place you on an email waitlist for feature updates.

In addition to personal information, we use web cookies to enhance your experience on our site by understanding how our site is used.

2. Use of Information

The information we collect is used solely for the purposes specified: order processing and to inform you of feature updates. We value your privacy and do not share your personal information with third parties.

3. Children's Privacy

LibreChat is committed to protecting the privacy of children. We do not knowingly collect any personal information from children under the age of 13.

4. Updates to This Policy

We may update this privacy policy from time to time. When we do, we will notify you by email. We encourage you to periodically review this page for the latest information on our privacy practices.

5. Contact Us

If you have any questions about this Privacy Policy, please contact us at`}{' '}
          <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link>
          {`. 

Your use of LibreChat indicates your agreement to this Privacy Policy.`}
        </pre>
      </div>
      <Button onClick={() => window.open('/', '_self')}>← Go Back</Button>
    </main>
  )
}

const TermsOfServices = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <h1 className="text-3xl font-extrabold pb-6">Terms and Conditions for LibreChat</h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Effective Date: February 18, 2024

Welcome to LibreChat, the informational website for the open-source AI chat platform, available at `}{' '}
          <Link href="https://librechat.ai">https://librechat.ai</Link>
          {`. These Terms of Service ("Terms") govern your use of our website and the services we offer. By accessing or using the Website, you agree to be bound by these Terms and our Privacy Policy, accessible at `}{' '}
          <Link href="https://librechat.ai/privacy">https://librechat.ai//privacy</Link>
          {`.

1. Ownership
Upon purchasing a package from LibreChat, you are granted the right to download and use the code for accessing an admin panel for LibreChat. While you own the downloaded code, you are expressly prohibited from reselling, redistributing, or otherwise transferring the code to third parties without explicit permission from LibreChat.

2. User Data
We collect personal data, such as your name, email address, and payment information, as described in our Privacy Policy. This information is collected to provide and improve our services, process transactions, and communicate with you.

3. Non-Personal Data Collection
The Website uses cookies to enhance user experience, analyze site usage, and facilitate certain functionalities. By using the Website, you consent to the use of cookies in accordance with our Privacy Policy.

4. Use of the Website
You agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Website. Prohibited behavior includes harassing or causing distress or inconvenience to any person, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Website.

5. Governing Law
These Terms shall be governed by and construed in accordance with the laws of the United States, without giving effect to any principles of conflicts of law.

6. Changes to the Terms
We reserve the right to modify these Terms at any time. We will notify users of any changes by email. Your continued use of the Website after such changes have been notified will constitute your consent to such changes.

7. Contact Information
If you have any questions about these Terms, please contact us at `}{' '}
          <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link>
          {`.

By using the Website, you acknowledge that you have read these Terms of Service and agree to be bound by them.`}
        </pre>
      </div>
    </main>
  )
}

const CookiePolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <h1 className="text-3xl font-extrabold pb-6">Cookie Policy for LibreChat</h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Effective Date: February 18, 2024

1. What Are Cookies
As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored; however, this may downgrade or 'break' certain elements of the site's functionality.

2. How We Use Cookies
We use cookies for various reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not, in case they are used to provide a service that you use.

3. Disabling Cookies
You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore, it is recommended that you do not disable cookies.

4. The Cookies We Set
  - Site preferences cookies: In order to provide you with a great experience on this site, we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences, we need to set cookies so that this information can be called whenever you interact with a page that is affected by your preferences.
  - Third-party cookies: In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site.

  5. Contact Information
If you have any questions about these policies, please contact us at `}{' '}
          <Link href="mailto:contact@librechat.ai">contact@librechat.ai</Link>
          {`.
`}
        </pre>
      </div>
      <Button onClick={() => window.open('/', '_self')}>← Go Back</Button>
    </main>
  )
}

export { TermsOfServices }
export { PrivacyPolicy }
export { CookiePolicy }
