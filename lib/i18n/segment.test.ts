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

  it('translates whitelisted display props on JSX components but preserves structural props', () => {
    const src = `<Callout type="warning" title="Developer Preview">

Some body text.

</Callout>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    expect(translatable).toContain('Developer Preview')
    expect(translatable).toContain('Some body text.')
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('')
    expect(verbatim).toContain('type="warning"')
    expect(verbatim).toContain('<Callout')
  })

  it('translates alt text on an image tag while preserving src', () => {
    const src = `<img src="/a.png" alt="search for a banana" />\n`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    expect(translatable).toContain('search for a banana')
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('')
    expect(verbatim).toContain('src="/a.png"')
  })

  it('translates only the description cell of OptionTable tuples', () => {
    const src = `<OptionTable
  options={[
    ['HOST', 'string', 'Specifies the host.', 'HOST=localhost'],
    ['PORT', 'number', 'Specifies the port.', 'PORT=3080'],
  ]}
/>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    expect(translatable).toContain('Specifies the host.')
    expect(translatable).toContain('Specifies the port.')
    // Keys, types, and examples stay verbatim (not translated).
    expect(translatable).not.toContain('HOST')
    expect(translatable).not.toContain('string')
    expect(translatable).not.toContain('HOST=localhost')
  })

  it('translates the description of a three-cell OptionTable row (no example column)', () => {
    const src = `<OptionTable
  options={[
    ['KEY', 'string', 'Sets the key.'],
  ]}
/>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    expect(translatable).toContain('Sets the key.')
    expect(translatable).not.toContain('KEY')
  })

  it('translates an OptionTable description containing an escaped quote', () => {
    const src = `<OptionTable
  options={[
    ['lang', 'string', 'Detect the user\\'s language.', 'auto'],
  ]}
/>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs
      .filter((s) => s.kind === 'translatable')
      .map((s) => s.text)
      .join('|')
    expect(translatable).toContain('Detect the user')
  })

  it('translates a display prop value that contains an apostrophe', () => {
    const src = `<Callout title="Don't forget this">

Body.

</Callout>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    expect(translatable).toContain("Don't forget this")
  })

  it('translates string-literal labels inside a whitelisted expression array prop', () => {
    const src = `<Tabs items={['Welcome Message', 'Security Alert']}>

Body.

</Tabs>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    expect(translatable).toContain('Welcome Message')
    expect(translatable).toContain('Security Alert')
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('')
    expect(verbatim).toContain('items={[')
  })

  it('does not translate a title info string on a fenced code block', () => {
    const src = '```yaml title="librechat.yaml"\nkey: value\n```\n'
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs
      .filter((s) => s.kind === 'translatable')
      .map((s) => s.text)
      .join('')
    expect(translatable).not.toContain('librechat.yaml')
  })

  it('keeps fenced code nested inside an MDX JSX component verbatim', () => {
    const src = `<Tabs items={['Docker', 'Local']}>
<Tabs.Tab>

Run the stack:

\`\`\`bash
docker compose up -d
\`\`\`

</Tabs.Tab>
</Tabs>
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs
      .filter((s) => s.kind === 'translatable')
      .map((s) => s.text)
      .join('\n')
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('\n')
    expect(translatable).not.toContain('docker compose up -d')
    expect(verbatim).toContain('docker compose up -d')
    // Prose inside the component is still translated.
    expect(translatable).toContain('Run the stack:')
  })

  it('keeps fenced code nested inside a list item verbatim', () => {
    const src = `1. First, run this:

   \`\`\`bash
   echo do-not-translate
   \`\`\`

2. Then continue.
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs
      .filter((s) => s.kind === 'translatable')
      .map((s) => s.text)
      .join('\n')
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('\n')
    expect(translatable).not.toContain('echo do-not-translate')
    expect(verbatim).toContain('echo do-not-translate')
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

  it('extracts and translates Markdown link labels in pages, preserving the URL', () => {
    const withLink = {
      title: 'Dev',
      pages: ['intro', '[Contributor Guidelines](https://x.test/c)', '---Section---'],
    }
    expect(extractMetaStrings(withLink)).toEqual(['Dev', 'Contributor Guidelines', 'Section'])
    const out = rebuildMeta(withLink, (s) =>
      s === 'Contributor Guidelines' ? 'Mitwirkende' : s === 'Section' ? 'Abschnitt' : s,
    ) as typeof withLink
    expect(out.pages).toEqual(['intro', '[Mitwirkende](https://x.test/c)', '---Abschnitt---'])
  })
})
