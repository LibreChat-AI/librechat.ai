import { describe, expect, it } from 'vitest'
import { GET } from '@/app/llms.txt/route'

describe('LLM index route', () => {
  it('returns the curated homepage representation as Markdown', async () => {
    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/markdown')
    expect(response.headers.get('vary')).toContain('Accept')
    await expect(response.text()).resolves.toContain('# LibreChat')
  })
})
