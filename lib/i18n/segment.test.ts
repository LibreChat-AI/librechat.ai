import { describe, it, expect } from 'vitest'
import {
  segmentMarkdown,
  reassemble,
  hashText,
  countCodeFences,
  extractMetaStrings,
  rebuildMeta,
  unescapeJsString,
  escapeJsString,
  collectBlockStructure,
  collectInlineCode,
  headingSlugText,
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

  it('keeps bare identifier headings verbatim but translates prose headings', () => {
    const src = `### enforce

Body one.

### addedEndpoints

Body two.

## Overview

Body three.
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('')
    expect(translatable).toContain('## Overview')
    expect(translatable).not.toContain('### enforce')
    expect(verbatim).toContain('### enforce')
    expect(verbatim).toContain('### addedEndpoints')
  })

  it('keeps header, env-var, and file-name headings verbatim while translating prose', () => {
    const src = `## Content-Security-Policy

Body one.

### AZURE_AI_SEARCH_API_KEY

Body two.

### .env

Body three.

## **Overview**

Body four.

## Self-Hosting the Sandpack Bundler

Body five.
`
    const segs = segmentMarkdown(src)
    expect(reassemble(segs)).toBe(src)
    const translatable = segs.filter((s) => s.kind === 'translatable').map((s) => s.text)
    const verbatim = segs
      .filter((s) => s.kind === 'verbatim')
      .map((s) => s.text)
      .join('')
    // Code-like single tokens stay verbatim.
    expect(verbatim).toContain('## Content-Security-Policy')
    expect(verbatim).toContain('### AZURE_AI_SEARCH_API_KEY')
    expect(verbatim).toContain('### .env')
    // Emphasised and multi-word prose headings are still translated.
    expect(translatable).toContain('## **Overview**')
    expect(translatable).toContain('## Self-Hosting the Sandpack Bundler')
    expect(verbatim).not.toContain('## **Overview**')
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

describe('JS string escape round-trip', () => {
  const Q = "'"

  it('preserves non-quote escapes through a translate round-trip', () => {
    // A model that returns the cleaned text unchanged must yield the original
    // source byte-for-byte. Covers single (\n) and doubled (\\n) backslashes,
    // tabs, and a literal backslash.
    for (const src of [
      String.raw`User: {input}\nAI: {output}`,
      String.raw`User: {input}\\nAI: {output}`,
      String.raw`col1\tcol2`,
      String.raw`a\\b path`,
    ]) {
      expect(escapeJsString(unescapeJsString(src, Q), Q)).toBe(src)
    }
  })

  it('decodes the escaped enclosing quote for the model and re-escapes apostrophes', () => {
    expect(unescapeJsString("Detect the user\\'s host", Q)).toBe("Detect the user's host")
    // A non-enclosing escaped quote is left intact.
    expect(unescapeJsString('say \\"hi\\"', Q)).toBe('say \\"hi\\"')
    // A bare apostrophe a translation introduces is escaped for the quote.
    expect(escapeJsString("Detecte l'utilisateur", Q)).toBe("Detecte l\\'utilisateur")
    // An already-escaped apostrophe is not doubled.
    expect(escapeJsString("l\\'utilisateur", Q)).toBe("l\\'utilisateur")
  })
})

describe('countCodeFences', () => {
  it('counts fenced code blocks', () => {
    expect(countCodeFences(SAMPLE)).toBe(1)
  })

  it('counts fenced blocks nested in a list item or blockquote', () => {
    const src = `1. Step one:

   \`\`\`bash
   echo hi
   \`\`\`

2. Step two.
`
    expect(countCodeFences(src)).toBe(1)
  })
})

describe('headingSlugText', () => {
  it('uses the rendered heading text (no link URL or markup) for slugging', () => {
    // A link's URL must not leak into the slug — only its visible label counts.
    expect(headingSlugText('## [Setup guide](https://x.test/a/b)')).toBe('Setup guide')
    expect(headingSlugText('## **Bold** and `code` heading')).toBe('Bold and code heading')
    expect(headingSlugText('### Plain heading')).toBe('Plain heading')
    expect(headingSlugText('## Heading [#explicit-id]')).toBe('Heading')
  })
})

describe('collectInlineCode fence handling', () => {
  it('does not strip past an inline triple-backtick to the next real fence', () => {
    // An inline ``` (mid-line, e.g. documenting the key chord) must not be treated
    // as a fenced-block opener — an unanchored stripper would remove everything up
    // to the next real fence, hiding `ctrl` from validation.
    const src = [
      'Press ``` to toggle.',
      '',
      'Then use `ctrl` to confirm.',
      '',
      '```bash',
      'echo hi',
      '```',
      '',
    ].join('\n')
    const codes = collectInlineCode(src)
    expect(codes).toContain('ctrl')
    // The real fenced block is still stripped (its content is not inline code).
    expect(codes).not.toContain('echo hi')
  })
})

describe('collectBlockStructure', () => {
  it('collects table delimiter rows (normalized) and blockquote markers', () => {
    const src = `| A | B |\n|:---|---:|\n| x | y |\n\n> quote one\n> quote two\n`
    const { tables, quotes } = collectBlockStructure(src)
    expect(tables).toEqual(['|:-|-:|'])
    expect(quotes).toEqual(['>', '>'])
  })

  it('ignores thematic breaks and prose pipes', () => {
    const src = `---\n\nUse a | b choice.\n`
    expect(collectBlockStructure(src).tables).toEqual([])
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
