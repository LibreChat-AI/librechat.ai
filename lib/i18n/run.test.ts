import { describe, it, expect, beforeEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runTranslation } from './run'
import type { TranslateModel } from './engine'

// Stub model: echoes the source block back unchanged (valid MDX), no network call.
const stub: TranslateModel = {
  generate: async ({ prompt }) => prompt.split(/Translate the following[^\n]*:\n/).pop() ?? '',
}

let content: string
let cache: string
beforeEach(async () => {
  const base = await mkdtemp(join(tmpdir(), 'run-'))
  content = join(base, 'docs')
  cache = join(base, 'cache')
  await mkdir(content, { recursive: true })
  await writeFile(
    join(content, 'index.mdx'),
    `---\ntitle: Hello\n---\n\n# Hello\n\nA paragraph.\n`,
  )
  await writeFile(join(content, 'meta.json'), JSON.stringify({ title: 'Docs', pages: ['index'] }))
})

describe('runTranslation', () => {
  it('writes a translated file and meta per locale and populates the cache', async () => {
    const stats = await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(stats.translatedBlocks).toBeGreaterThan(0)

    const files = await readdir(content)
    expect(files).toContain('index.de.mdx')
    expect(files).toContain('meta.de.json')

    const cacheFiles = await readdir(cache)
    expect(cacheFiles).toContain('de.json')
  })

  it('on a second run reuses the cache and translates zero blocks', async () => {
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    const second = await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(second.translatedBlocks).toBe(0)
    expect(second.cachedBlocks).toBeGreaterThan(0)
  })

  it('re-translates only the changed block after an edit', async () => {
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n# Hello\n\nA changed paragraph.\n`,
    )
    const after = await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(after.translatedBlocks).toBe(1)
  })
})
