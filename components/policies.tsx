import { Link } from 'nextra-theme-docs'
import { Button } from 'nextra/components'

const PrivacyPolicy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <h1 className="text-3xl font-extrabold pb-6">Privacy Policy for LibreChat Documentation</h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Effective Date: ${currentDate}

This Privacy Policy outlines how the LibreChat documentation website (`}{' '}
          <Link href="https://librechat.ai">https://librechat.ai</Link>
          {`) operates with respect to user privacy.

1. No Data Collection

We do not collect, store, or process any personal information when you visit our documentation site. This includes:
- No collection of names, email addresses, or contact information
- No use of cookies or tracking technologies
- No analytics or usage tracking
- No user accounts or authentication

2. Purpose of This Site

This website serves solely as documentation for the open-source LibreChat project. It provides:
- Installation guides
- Configuration documentation
- API references
- User guides
- Contributing guidelines

3. External Links

Our documentation may contain links to external websites, including:
- The LibreChat GitHub repository
- Third-party service documentation
- Community resources

We are not responsible for the privacy practices of these external sites.

4. Changes to This Policy

We may update this privacy policy to reflect changes in our practices or for clarity. Any updates will be posted on this page with an updated effective date.

5. Contact Information

For questions about this privacy policy or the LibreChat project, please visit our GitHub repository at`}{' '}
          <Link href="https://github.com/danny-avila/LibreChat">
            https://github.com/danny-avila/LibreChat
          </Link>
          {`.

By using this documentation site, you acknowledge that no personal data is collected or processed.`}
        </pre>
      </div>
      <Button onClick={() => window.open('/', '_self')}>← Go Back</Button>
    </main>
  )
}

const TermsOfServices = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <h1 className="text-3xl font-extrabold pb-6">
          Terms of Service for LibreChat Documentation
        </h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Effective Date: ${currentDate}

Welcome to the LibreChat documentation website, available at `}{' '}
          <Link href="https://librechat.ai">https://librechat.ai</Link>
          {`. These Terms of Service ("Terms") govern your use of our documentation website.

1. Purpose and Scope

This website provides documentation for LibreChat, an open-source AI chat platform. The site is purely informational and includes:
- Technical documentation
- Installation and setup guides
- Configuration references
- API documentation
- Contributing guidelines
- Blog posts related to LibreChat

2. No Commercial Services

This documentation site:
- Does not sell any products or services
- Does not require payment for access
- Does not collect user data or personal information
- Does not require user registration or accounts

3. Open Source Project

LibreChat is an open-source project licensed under the MIT License. The source code is available at:`}{' '}
          <Link href="https://github.com/danny-avila/LibreChat">
            https://github.com/danny-avila/LibreChat
          </Link>
          {`

4. Use of Documentation

You may freely:
- Access and read all documentation
- Share links to the documentation
- Use the documentation to implement and configure LibreChat
- Contribute improvements to the documentation via GitHub

5. No Warranty

This documentation is provided "as is" without warranty of any kind. While we strive for accuracy, we make no guarantees about:
- The completeness or accuracy of the documentation
- The suitability of LibreChat for any particular purpose
- The availability of this documentation site

6. External Resources

Our documentation may reference or link to third-party services, tools, or resources. We are not responsible for:
- The content or practices of external sites
- The availability of external resources
- Any issues arising from the use of third-party services

7. Intellectual Property

The documentation content is licensed under the MIT License, consistent with the LibreChat project. You are free to use, modify, and distribute the documentation in accordance with this license.

8. Changes to Terms

We may update these terms to reflect changes in the project or for clarity. Updates will be posted on this page with a new effective date.

9. Contact

For questions about these terms or to contribute to the project, please visit:`}{' '}
          <Link href="https://github.com/danny-avila/LibreChat">
            https://github.com/danny-avila/LibreChat
          </Link>
          {`

By using this documentation site, you agree to these Terms of Service.`}
        </pre>
      </div>
    </main>
  )
}

const CookiePolicy = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <h1 className="text-3xl font-extrabold pb-6">Cookie Policy for LibreChat Documentation</h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Effective Date: ${currentDate}

1. No Cookies Used

The LibreChat documentation website (`}{' '}
          <Link href="https://librechat.ai">https://librechat.ai</Link>
          {`) does not use cookies or any similar tracking technologies.

2. No Data Collection

We do not:
- Set or read cookies
- Use web beacons or tracking pixels
- Employ analytics or tracking scripts
- Collect any personal information
- Track user behavior or preferences

3. Third-Party Services

While our site does not use cookies, please note:
- External links may lead to sites that use cookies
- Your browser may have its own cookie settings
- We are not responsible for cookies set by external sites

4. Browser Storage

This documentation site may use browser features like:
- Local storage for theme preferences (light/dark mode)
- Session storage for navigation state

This data is stored only in your browser and is never transmitted to any server.

5. Your Privacy

Since we don't use cookies or collect data:
- There's nothing to opt out of
- No personal information is at risk
- Your browsing is completely private

6. Changes to This Policy

Any updates to this policy will be posted here with a new effective date. However, we do not anticipate adding cookies or tracking to this documentation site.

7. Contact

For questions about this policy or the LibreChat project, visit:`}{' '}
          <Link href="https://github.com/danny-avila/LibreChat">
            https://github.com/danny-avila/LibreChat
          </Link>
          {`

By using this site, you acknowledge that no cookies or tracking technologies are employed.`}
        </pre>
      </div>
      <Button onClick={() => window.open('/', '_self')}>← Go Back</Button>
    </main>
  )
}

export { TermsOfServices }
export { PrivacyPolicy }
export { CookiePolicy }
