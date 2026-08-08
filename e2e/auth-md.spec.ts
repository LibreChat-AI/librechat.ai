import { expect, test } from '@playwright/test'

test('publishes self-contained auth.md agent discovery', async ({ request }) => {
  const response = await request.get('/auth.md')

  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('text/markdown')

  const body = await response.text()
  expect(body).toMatch(/^# .*auth\.md$/m)
  expect(body).toContain('## Agent audience')
  expect(body).toContain('Registration endpoint: none')
  expect(body).toContain('Anonymous HTTPS')
  expect(body).toContain('No credentials are issued or required')
})
