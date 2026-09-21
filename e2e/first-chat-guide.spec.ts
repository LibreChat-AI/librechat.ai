import { expect, test, type Page } from '@playwright/test'

const FIRST_CHAT = '/docs/quick_start/first_chat'

function body(page: Page) {
  return page.locator('#nd-page')
}

test.describe('First chat guide', () => {
  test('@scenario:docs-landing-offers-demo-and-first-chat a reader on /docs is offered the demo and the install path', async ({
    page,
  }) => {
    await page.goto('/docs')

    const callout = body(page).getByText('Just want to start chatting?').locator('..')
    await expect(callout).toBeVisible()

    // The site itself advertises chat.librechat.ai, so the landing page must
    // point a "just let me try it" reader there rather than deny it exists.
    await expect(callout.getByRole('link', { name: 'chat.librechat.ai' })).toHaveAttribute(
      'href',
      'https://chat.librechat.ai',
    )
    await expect(body(page).getByRole('link', { name: 'Your First Chat' }).first()).toHaveAttribute(
      'href',
      FIRST_CHAT,
    )
    await expect(body(page).getByText('no hosted instance')).toHaveCount(0)
  })

  test('@scenario:first-chat-walks-from-login-to-first-message the guide runs from the login page to a sent message', async ({
    page,
  }) => {
    await page.goto(FIRST_CHAT)

    await expect(page.getByRole('heading', { name: 'Your First Chat', level: 1 })).toBeVisible()

    const steps = [
      'Open LibreChat in your browser',
      'Create your account',
      'Give a model an API key',
      'Send your first message',
    ]
    for (const step of steps) {
      await expect(body(page).getByRole('heading', { name: step })).toBeVisible()
    }

    // Order matters: the steps are a walkthrough, not a list of topics.
    const rendered = await body(page).getByRole('heading', { level: 3 }).allInnerTexts()
    expect(rendered.filter((text) => steps.includes(text.trim()))).toEqual(steps)
  })

  test('@scenario:quick-start-sidebar-lists-first-chat the Quick Start sidebar lists the guide after Local Setup', async ({
    page,
  }) => {
    await page.goto(FIRST_CHAT)

    const sidebar = page.locator('#nd-sidebar')
    const quickStartLinks = await sidebar
      .getByRole('link')
      .evaluateAll((links) =>
        links
          .map((link) => (link as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter((href) => href.startsWith('/docs/quick_start')),
      )

    expect(quickStartLinks).toEqual([
      '/docs/quick_start',
      '/docs/quick_start/local_setup',
      FIRST_CHAT,
      '/docs/quick_start/custom_endpoints',
    ])
  })

  test('@scenario:install-guides-hand-off-to-first-chat every install path ends by linking to the guide', async ({
    page,
  }) => {
    // Every terminal install path advertised by the Local Installation and
    // Remote Hosting indexes, so none of them can quietly dead-end again.
    for (const guide of [
      '/docs/quick_start/local_setup',
      '/docs/local/docker',
      '/docs/local/npm',
      '/docs/local/helm_chart',
      '/docs/remote/railway',
      '/docs/remote/docker_linux',
      '/docs/remote/huggingface',
    ]) {
      await page.goto(guide)
      await expect(
        body(page).getByRole('link', { name: 'Your First Chat' }).first(),
        `${guide} should hand off to the first-chat guide`,
      ).toHaveAttribute('href', FIRST_CHAT)
    }
  })

  test('@scenario:later-accounts-are-not-promised-a-regular-role the admin callout states the default role and its OpenID override', async ({
    page,
  }) => {
    await page.goto(FIRST_CHAT)

    // A reader whose instance shows no Sign up needs the symptom answered, not
    // the precedence of ALLOW_EMAIL_LOGIN, ALLOW_REGISTRATION and LDAP, which
    // the authentication reference owns.
    const noSignup = body(page).locator('p').filter({ hasText: 'If there is no Sign up' })
    await expect(noSignup).toContainText('create your account on first sign-in')
    await expect(noSignup).toContainText('ask whoever runs the instance')
    await expect(noSignup.getByRole('link', { name: 'authentication settings' })).toHaveAttribute(
      'href',
      '/docs/configuration/authentication',
    )

    const callout = body(page).getByText('First Account = Admin').locator('..')
    await expect(callout).toContainText('becomes the admin account')
    // OPENID_ADMIN_ROLE elevates a later account, so the page must not promise
    // that every account after the first stays a regular user.
    await expect(callout).toContainText('OPENID_ADMIN_ROLE')
    await expect(callout).toContainText('by default')
    await expect(
      body(page).getByText('Every account created after it is a regular user'),
    ).toHaveCount(0)
  })

  test('@scenario:ldap-readers-are-sent-to-the-standard-form LDAP is described as the normal sign-in form, not a button', async ({
    page,
  }) => {
    await page.goto(FIRST_CHAT)

    const ldapParagraph = body(page).getByText('adds no button')
    await expect(ldapParagraph).toBeVisible()
    await expect(ldapParagraph).toContainText('LDAP_LOGIN_USES_USERNAME')
    await expect(ldapParagraph.getByRole('link', { name: 'LDAP/AD' })).toHaveAttribute(
      'href',
      '/docs/configuration/authentication/ldap',
    )
  })

  test('@scenario:nothing-loads-covers-each-install-path the load troubleshooting answers Docker, npm and hosted readers', async ({
    page,
  }) => {
    await page.goto(FIRST_CHAT)

    const heading = body(page).getByRole('heading', { name: 'If nothing loads' })
    await expect(heading).toBeVisible()

    const section = body(page).locator('ul').filter({ hasText: 'docker compose ps' })
    await expect(section).toContainText('docker compose logs api')
    await expect(section).toContainText('npm run backend')
    // Every install path the page links to needs its own check, Helm included.
    await expect(section).toContainText('kubectl get pods')
    await expect(section).toContainText('Railway')
    // The remote Docker guide runs a non-default compose file as root.
    await expect(section).toContainText('deploy-compose.yml')
    await expect(section.getByRole('link', { name: 'Helm' })).toHaveAttribute(
      'href',
      '/docs/local/helm_chart',
    )
  })

  test('@scenario:server-key-location-matches-the-install-path the server-key step names where each install keeps its environment', async ({
    page,
  }) => {
    await page.goto(FIRST_CHAT)

    // user_provided is an .env.example default, not a universal one.
    const userProvided = body(page)
      .locator('p')
      .filter({ hasText: 'a default only where the install starts from' })
    await expect(userProvided).toContainText('Helm')
    await expect(userProvided).toContainText('does not load at all')
    // The tab renders as "Data & Privacy" (com_ui_settings_tab_data), not "Data controls".
    await expect(userProvided).toContainText('Data & Privacy')

    const serverKey = body(page).getByText('To configure a key once for everyone')
    await expect(serverKey).toContainText('.env')
    await expect(serverKey).toContainText('Kubernetes Secret')
    await expect(serverKey).toContainText('Railway')
    await expect(serverKey).toContainText('Space Secrets')

    // The browsing address comes from the host, not from DOMAIN_CLIENT.
    const openStep = body(page).locator('p').filter({ hasText: 'DOMAIN_CLIENT' })
    await expect(openStep).toContainText('the address LibreChat puts in the links it generates')
    await expect(openStep).toContainText('the one your deployment hands you')
  })

  test('@scenario:first-chat-internal-links-resolve every internal link on the guide and the landing callout resolves', async ({
    page,
    request,
  }) => {
    const seen = new Set<string>()

    for (const source of [FIRST_CHAT, '/docs']) {
      await page.goto(source)
      const hrefs: string[] = await body(page)
        .getByRole('link')
        .evaluateAll((links) =>
          links
            .map((link) => (link as HTMLAnchorElement).getAttribute('href') ?? '')
            .filter((href) => href.startsWith('/') || href.startsWith('#')),
        )
      expect(hrefs.length, `${source} should have internal links`).toBeGreaterThan(0)
      // A same-page link carries no path, so bind it to the page it was found on.
      for (const href of hrefs) seen.add(href.startsWith('#') ? `${source}${href}` : href)
    }

    // The landing callout links the demo's own terms and privacy pages.
    expect(seen).toContain('/demo/terms')
    expect(seen).toContain('/demo/privacy')

    let fragmentsChecked = 0
    for (const href of seen) {
      const [path, fragment] = href.split('#')
      const response = await request.get(path)
      expect(response.status(), `${href} should resolve`).toBe(200)

      // A fragment that names no heading is a dead link CI would otherwise miss.
      if (fragment) {
        fragmentsChecked += 1
        await page.goto(path)
        await expect(
          page.locator(`[id="${fragment}"]`),
          `${href} should have a target on the page`,
        ).toHaveCount(1)
      }
    }

    // Guards the anchor assertion itself: it is conditional, so a page that
    // lost every fragment link would otherwise pass without checking one.
    expect(fragmentsChecked).toBeGreaterThan(0)
  })

  test('@scenario:first-chat-renders-in-both-themes the guide renders in light and dark mode', async ({
    page,
  }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme })
      await page.goto(FIRST_CHAT)

      await expect(page.locator('html')).toHaveClass(
        colorScheme === 'dark' ? /dark/ : /^(?!.*dark).*$/,
      )
      await expect(page.getByRole('heading', { name: 'Your First Chat', level: 1 })).toBeVisible()
      await expect(body(page).getByRole('heading', { name: 'If nothing loads' })).toBeVisible()
    }
  })
})
