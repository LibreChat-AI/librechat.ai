import { describe, it, expect } from 'vitest'
import {
  segmentMarkdown,
  reassemble,
  hashText,
  countCodeFences,
  extractMetaStrings,
  rebuildMeta,
} from './segment'

const SAMPLE = `import { Callout } from 'x'

# Hello world

This is a paragraph with **bold** text.

\`\`\`bash
echo "do not translate"
\`\`\`

- first item
- second item
`

describe('segmentMarkdown', () => {
  it('round-trips: reassembling the segments yields the original source', () => {
    const segs = segmentMarkdown(SAMPLE)
    expect(reassemble(segs)).toBe(SAMPLE)
  })

  it('marks prose blocks translatable and code/imports verbatim', () => {
    const segs = segmentMarkdown(SAMPLE)
    const heading = segs.find((s) => s.text.startsWith('# Hello'))
    const code = segs.find((s) => s.text.includes('echo'))
    const imp = segs.find((s) => s.text.startsWith('import'))
    expect(heading?.kind).toBe('translatable')
    expect(code?.kind).toBe('verbatim')
    expect(imp?.kind).toBe('verbatim')
  })

  it('hashes are stable and include the prompt version', () => {
    const segs = segmentMarkdown(SAMPLE).filter((s) => s.kind === 'translatable')
    expect(segs[0].kind === 'translatable' && segs[0].hash).toBe(hashText('# Hello world'))
  })
})

describe('countCodeFences', () => {
  it('counts fenced code blocks', () => {
    expect(countCodeFences(SAMPLE)).toBe(1)
  })
})

describe('meta json helpers', () => {
  const meta = { title: 'Toolkit', icon: 'Wrench', pages: ['index', '---Deploy---', 'local'] }

  it('extracts the title and separator labels only', () => {
    expect(extractMetaStrings(meta)).toEqual(['Toolkit', 'Deploy'])
  })

  it('rebuilds with translations, preserving slugs and structure', () => {
    const out = rebuildMeta(meta, (s) =>
      s === 'Toolkit' ? 'Werkzeug' : s === 'Deploy' ? 'Bereitstellen' : s,
    ) as typeof meta
    expect(out.title).toBe('Werkzeug')
    expect(out.icon).toBe('Wrench')
    expect(out.pages).toEqual(['index', '---Bereitstellen---', 'local'])
  })
})
