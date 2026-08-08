import { createHash } from 'node:crypto'
import { expect, test } from '@playwright/test'
import matter from 'gray-matter'

const DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json'
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SHA256_DIGEST = /^sha256:[a-f0-9]{64}$/

interface SkillEntry {
  name: string
  type: 'skill-md' | 'archive'
  description: string
  url: string
  digest: string
}

interface DiscoveryIndex {
  $schema: string
  skills: SkillEntry[]
}

test.describe('Agent Skills discovery', () => {
  test('publishes a valid v0.2.0 index and verifiable skill artifacts', async ({ request }) => {
    const response = await request.get('/.well-known/agent-skills/index.json')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/json')

    const index = (await response.json()) as DiscoveryIndex
    expect(index.$schema).toBe(DISCOVERY_SCHEMA)
    expect(index.skills.length).toBeGreaterThan(0)

    for (const skill of index.skills) {
      expect(skill.name).toMatch(SKILL_NAME)
      expect(skill.name.length).toBeLessThanOrEqual(64)
      expect(['skill-md', 'archive']).toContain(skill.type)
      expect(skill.description.length).toBeGreaterThan(0)
      expect(skill.description.length).toBeLessThanOrEqual(1024)
      expect(skill.url.length).toBeGreaterThan(0)
      expect(skill.digest).toMatch(SHA256_DIGEST)

      const artifactResponse = await request.get(skill.url)
      expect(artifactResponse.status()).toBe(200)

      const artifact = await artifactResponse.body()
      const digest = createHash('sha256').update(artifact).digest('hex')
      expect(skill.digest).toBe(`sha256:${digest}`)

      if (skill.type === 'skill-md') {
        expect(artifactResponse.headers()['content-type']).toMatch(/^text\/(markdown|plain)/)
        const { data } = matter(artifact.toString('utf8'))
        expect(data.name).toBe(skill.name)
        expect(data.description).toBe(skill.description)
      }

      const artifactHead = await request.head(skill.url)
      expect(artifactHead.status()).toBe(200)
    }

    const indexHead = await request.head('/.well-known/agent-skills/index.json')
    expect(indexHead.status()).toBe(200)
  })
})
