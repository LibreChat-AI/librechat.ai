import { describe, expect, it } from 'vitest'
import { GET } from '../route'

describe('GET /auth.md', () => {
  it('publishes self-contained anonymous agent discovery', async () => {
    const response = await GET()
    const body = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/markdown')
    expect(body).toMatch(/^# .*auth\.md$/m)
    expect(body).toContain('## Agent audience')
    expect(body).toContain('Registration endpoint: none')
    expect(body).toContain('Anonymous HTTPS')
    expect(body).toContain('No credentials are issued or required')
  })
})
