import { describe, it, expect, beforeEach } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runTranslation } from './run'
import type { TranslateModel } from './engine'
import { TM } from './tm'
import { hashText } from './segment'

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
  await writeFile(join(content, 'index.mdx'), `---\ntitle: Hello\n---\n\n# Hello\n\nA paragraph.\n`)
  await writeFile(join(content, 'meta.json'), JSON.stringify({ title: 'Docs', pages: ['index'] }))
})

describe('runTranslation', () => {
  it('writes a translated file and meta per locale and populates the cache', async () => {
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: stub,
    })
    expect(stats.translatedBlocks).toBeGreaterThan(0)

    const files = await readdir(content)
    expect(files).toContain('index.de.mdx')
    expect(files).toContain('meta.de.json')

    const cacheFiles = await readdir(cache)
    expect(cacheFiles).toContain('de.json')
  })

  it('on a second run reuses the cache and translates zero blocks', async () => {
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    const second = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: stub,
    })
    expect(second.translatedBlocks).toBe(0)
    expect(second.cachedBlocks).toBeGreaterThan(0)
  })

  it('re-translates only the changed block after an edit', async () => {
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n# Hello\n\nA changed paragraph.\n`,
    )
    const after = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: stub,
    })
    expect(after.translatedBlocks).toBe(1)
  })

  it('removes an orphaned locale file in a subdirectory', async () => {
    await mkdir(join(content, 'sub'), { recursive: true })
    await writeFile(join(content, 'sub', 'page.mdx'), `---\ntitle: Page\n---\n\n# Page\n\nText.\n`)
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(await readdir(join(content, 'sub'))).toContain('page.de.mdx')

    await rm(join(content, 'sub', 'page.mdx'))
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(await readdir(join(content, 'sub'))).not.toContain('page.de.mdx')
  })

  // Guards the first-occurrence `f.replace` bug: a directory name containing the
  // locale token would corrupt baseRel and wrongly delete a live (non-orphan) file.
  it('keeps a live locale file when a parent dir name contains the locale token', async () => {
    const dir = join(content, 'a.de.mdx-dir')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'page.mdx'), `---\ntitle: Page\n---\n\n# Page\n\nText.\n`)
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(await readdir(dir)).toContain('page.de.mdx')

    // Second full run: the source still exists, so the locale file must survive.
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(await readdir(dir)).toContain('page.de.mdx')
  })

  it('pins translated heading ids to the English slug so same-page anchors resolve', async () => {
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n## What is RAG\n\nSee [below](#what-is-rag).\n`,
    )
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    const out = await readFile(join(content, 'index.de.mdx'), 'utf8')
    expect(out).toContain('## What is RAG [#what-is-rag]')
    expect(out).toContain('(#what-is-rag)')
  })

  it('removes a stale locale file when a re-translation fails validation', async () => {
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    expect(await readdir(content)).toContain('index.de.mdx')

    // Source changes and the new translation fails validation (breaking stub).
    const breaking: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        return text.startsWith('#') ? `${text}\n\n\`\`\`\nx\n\`\`\`` : text
      },
    }
    await writeFile(join(content, 'index.mdx'), `---\ntitle: Hello\n---\n\n# Changed Heading\n`)
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: breaking,
    })
    expect(stats.skipped.length).toBeGreaterThan(0)
    expect(await readdir(content)).not.toContain('index.de.mdx')
  })

  it("does not persist a file's translations when it fails validation", async () => {
    // Stub that injects a stray code fence into heading translations, breaking the
    // output fence count so validateTranslation rejects the file.
    const breaking: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        return text.startsWith('#') ? `${text}\n\n\`\`\`\nx\n\`\`\`` : text
      },
    }
    await writeFile(join(content, 'index.mdx'), `---\ntitle: Hello\n---\n\n# Head\n`)
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: breaking,
    })
    expect(stats.skipped.length).toBeGreaterThan(0)
    expect(await readdir(content)).not.toContain('index.de.mdx')
    const tm = await TM.load('de', cache)
    expect(tm.get(hashText('# Head'))).toBeUndefined()
  })
})
