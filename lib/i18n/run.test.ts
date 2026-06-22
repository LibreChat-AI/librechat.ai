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

  it('attaches the heading id even when the model appends a trailing newline', async () => {
    // Real models can emit a trailing newline after a heading block. The id must
    // still terminate the heading line, not land on the next line where Fumadocs
    // would ignore it and the same-page anchor would break.
    const trailingNewline: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        return text.startsWith('#') ? `${text}\n` : text
      },
    }
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n## What is RAG\n\nSee [below](#what-is-rag).\n`,
    )
    await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: trailingNewline,
    })
    const out = await readFile(join(content, 'index.de.mdx'), 'utf8')
    expect(out).toContain('## What is RAG [#what-is-rag]')
    expect(out).not.toMatch(/## What is RAG\n\s*\[#what-is-rag\]/)
  })

  it('derives a linked heading id from the rendered text, not the URL', async () => {
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n## See [the readme](https://github.com/x/y)\n\nBody.\n`,
    )
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    const out = await readFile(join(content, 'index.de.mdx'), 'utf8')
    // Slug from the visible text "See the readme", with no pieces of the URL.
    expect(out).toContain('## See [the readme](https://github.com/x/y) [#see-the-readme]')
  })

  it('escapes an apostrophe a translation adds inside a single-quoted JSX string', async () => {
    // Simulates a French-style translation that introduces an apostrophe into a
    // single-quoted OptionTable description. Without escaping the generated MDX is
    // unparseable and the page would be skipped/deleted.
    const apostrophe: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        return text.includes('Detect') ? "Detecte l'utilisateur." : text
      },
    }
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n<OptionTable options={[['k', 'string', 'Detect the user.', 'auto']]} />\n`,
    )
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: apostrophe,
    })
    expect(stats.skipped).toEqual([])
    const out = await readFile(join(content, 'index.de.mdx'), 'utf8')
    expect(out).toContain("l\\'utilisateur")
  })

  it('preserves a backslash escape inside a single-quoted OptionTable description', async () => {
    // The description carries a single-backslash \n (a documented template
    // separator). It must survive the unescape/translate/re-escape round-trip
    // rather than collapsing to a bare "n".
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n<OptionTable options={[['k', 'string', 'Use the User: {input}\\nAI: {output} format.', 'x']]} />\n`,
    )
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: stub,
    })
    expect(stats.skipped).toEqual([])
    const out = await readFile(join(content, 'index.de.mdx'), 'utf8')
    expect(out).toContain('User: {input}\\nAI: {output}')
    expect(out).not.toContain('{input}nAI')
  })

  it('skips a file on empty model output without aborting the run or caching it', async () => {
    const emptyStub: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        return text.includes('A paragraph') ? '' : text
      },
    }
    // index.mdx (from beforeEach) contains "A paragraph." and will fail; ok.mdx must
    // still translate, proving one bad file does not abort the whole locale run.
    await writeFile(join(content, 'ok.mdx'), `---\ntitle: Ok\n---\n\n# Ok\n\nFine text.\n`)
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: emptyStub,
    })
    expect(stats.skipped.some((s) => s.includes('index.mdx'))).toBe(true)
    const files = await readdir(content)
    expect(files).toContain('ok.de.mdx')
    expect(files).not.toContain('index.de.mdx')
    const tm = await TM.load('de', cache)
    expect(tm.get(hashText('A paragraph.'))).toBeUndefined()
  })

  it('pins a colliding verbatim identifier heading to the English suffixed slug', async () => {
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n## Endpoints\n\nProse.\n\n### endpoints\n\nMore.\n`,
    )
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    const out = await readFile(join(content, 'index.de.mdx'), 'utf8')
    expect(out).toContain('## Endpoints [#endpoints]')
    expect(out).toContain('### endpoints [#endpoints-1]')
  })

  it('keeps the existing translation when a re-translation throws (transient failure)', async () => {
    // First run succeeds and writes index.de.mdx.
    await runTranslation({ contentDir: content, cacheDir: cache, locales: ['de'], model: stub })
    const before = await readFile(join(content, 'index.de.mdx'), 'utf8')

    // Source changes and the model now throws (provider/network error). The
    // existing translation must survive — deleting it would commit a provider blip
    // as data loss. (A successful-but-broken translation is handled separately.)
    const throwing: TranslateModel = {
      generate: async () => {
        throw new Error('simulated provider error')
      },
    }
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n# Hello\n\nChanged text.\n`,
    )
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: throwing,
    })
    expect(stats.skipped.length).toBeGreaterThan(0)
    expect(await readdir(content)).toContain('index.de.mdx')
    expect(await readFile(join(content, 'index.de.mdx'), 'utf8')).toBe(before)
  })

  it('retries a transiently-failing file within one run until it succeeds', async () => {
    // A rate-limit/provider error throws on the first attempt for the paragraph
    // block, then succeeds. A single run must converge (translate the file) rather
    // than skipping it and requiring the whole workflow to be re-run.
    let thrown = false
    const flaky: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        if (text.includes('A paragraph') && !thrown) {
          thrown = true
          throw Object.assign(new Error('429 Too Many Requests'), { statusCode: 429 })
        }
        return text
      },
    }
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: flaky,
    })
    expect(stats.skipped).toEqual([])
    expect(await readdir(content)).toContain('index.de.mdx')
  })

  it('caches blocks that succeeded before a later block failed transiently', async () => {
    // index.mdx (beforeEach) has two blocks: the heading "# Hello" translates
    // fine, but "A paragraph." is rate-limited on every attempt, so the file is
    // skipped this run. The heading's translation must still be cached: otherwise
    // a long file re-translates every block on each rate-limited run and can never
    // converge (it only succeeds if ALL blocks survive one uninterrupted pass).
    const rateLimited: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        if (text.includes('A paragraph')) {
          throw Object.assign(new Error('429 Too Many Requests'), { statusCode: 429 })
        }
        return text
      },
    }
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model: rateLimited,
    })
    expect(stats.skipped.some((s) => s.includes('index.mdx'))).toBe(true)
    expect(await readdir(content)).not.toContain('index.de.mdx')

    const tm = await TM.load('de', cache)
    expect(tm.get(hashText('# Hello'))).toBe('# Hello') // succeeded → cached
    expect(tm.get(hashText('A paragraph.'))).toBeUndefined() // failed → not cached
  })

  it('evicts cached blocks when the file later fails validation, so it is not permanently skipped', async () => {
    // The partial-cache hazard under load: a structurally bad block (a heading
    // that gains a stray code fence) is staged, then a LATER block in the same
    // file is rate-limited — so the transient path caches the bad block before the
    // file ever validates. On the next round the bad block is read back from cache,
    // the file fails validation and is skipped. The bad block must be evicted, or
    // every future run reads it back, fails validation again, and the page stays
    // skipped forever until a forced retranslation or a manual cache delete.
    let paragraphThrown = false
    const model: TranslateModel = {
      generate: async ({ prompt }) => {
        const text = prompt.split(/Translate the following[^\n]*:\n/).pop() ?? ''
        if (text.includes('A paragraph') && !paragraphThrown) {
          paragraphThrown = true
          throw Object.assign(new Error('429 Too Many Requests'), { statusCode: 429 })
        }
        return text.startsWith('#') ? `${text}\n\n\`\`\`\nx\n\`\`\`` : text
      },
    }
    await writeFile(
      join(content, 'index.mdx'),
      `---\ntitle: Hello\n---\n\n# Head\n\nA paragraph.\n`,
    )
    const stats = await runTranslation({
      contentDir: content,
      cacheDir: cache,
      locales: ['de'],
      model,
    })
    expect(stats.skipped.some((s) => s.includes('index.mdx'))).toBe(true)
    const tm = await TM.load('de', cache)
    expect(tm.get(hashText('# Head'))).toBeUndefined() // bad block evicted, not frozen
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
