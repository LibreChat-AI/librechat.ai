import { describe, it, expect } from 'vitest'
import { validatePreservedText, validateTranslation } from './validate'

const SOURCE = `---
title: Hello
description: A page
---

# Hello

\`\`\`bash
echo hi
\`\`\`
`

describe('validateTranslation', () => {
  it('accepts a structurally identical translation', () => {
    const out = SOURCE.replace('# Hello', '# Hallo').replace('title: Hello', 'title: Hallo')
    expect(validateTranslation(SOURCE, out).ok).toBe(true)
  })

  it('rejects a missing frontmatter key', () => {
    const out = `---\ntitle: Hallo\n---\n\n# Hallo\n\n\`\`\`bash\necho hi\n\`\`\`\n`
    const result = validateTranslation(SOURCE, out)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/frontmatter/i)
  })

  it('rejects a dropped code block', () => {
    const out = `---\ntitle: Hallo\ndescription: Eine Seite\n---\n\n# Hallo\n`
    const result = validateTranslation(SOURCE, out)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/code/i)
  })

  it('rejects output that is not parseable MDX', () => {
    const out = `---\ntitle: Hallo\ndescription: Eine Seite\n---\n\n<<not valid mdx<<\n`
    const result = validateTranslation(SOURCE, out)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/parseable|parse/i)
  })

  it('accepts translated prose that preserves inline code, rejects a changed identifier', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nSet the \`PORT\` variable before start.\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\nSetze die Variable \`PORT\` vor dem Start.\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\nSetze die Variable \`ANSCHLUSS\` vor dem Start.\n`
    expect(validateTranslation(src, good).ok).toBe(true)
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inline code/i)
  })

  it('rejects a changed inline code identifier inside a frontmatter description', () => {
    const src = `---\ntitle: T\ndescription: Guide for the \`.env\` file\n---\n\nBody.\n`
    const bad = `---\ntitle: T\ndescription: Anleitung für die \`.umgebung\` Datei\n---\n\nKörper.\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inline code/i)
  })

  it('validates inline fragments without parsing angle-bracket prose as JSX', () => {
    const source =
      '<Optional>: The attribute in the SAML assertion containing the user email. (default: email)'
    const output =
      '<Optional>: Das Attribut in der SAML-Assertion, das die Benutzer-E-Mail enthält. (default: email)'
    expect(validatePreservedText(source, output, 'inline').ok).toBe(true)
  })

  it('still protects inline tokens when validating raw inline fragments', () => {
    const source = '<Optional>: Set `SAML_EMAIL_CLAIM` from https://example.com/docs.'
    const bad = '<Optional>: Set `SAML_EMAIL` from https://example.com/anleitung.'
    const result = validatePreservedText(source, bad, 'inline')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inline code|link target/i)
  })

  it('rejects a rewritten link target, accepts translated link text', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nSee the [setup guide](/docs/setup).\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\nSiehe die [Einrichtungsanleitung](/docs/setup).\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\nSiehe die [Einrichtungsanleitung](/de/docs/einrichtung).\n`
    expect(validateTranslation(src, good).ok).toBe(true)
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/link target/i)
  })

  it('rejects a rewritten Markdown link target inside a JSX expression string', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['k', 'string', 'See [params](#default-parameters).', 'x']]} />\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['k', 'string', 'Siehe [Parameter](#geanderte-parameter).', 'x']]} />\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/link target/i)
  })

  it('rejects a changed code identifier inside a JSX expression string', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['K', 'string', 'Set in \`docker-compose.override.yml\`', 'ex']]} />\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['K', 'string', 'Setze in \`docker-compose.umgebung.yml\`', 'ex']]} />\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/inline code/i)
  })

  // One fixture exercising every token class the guard must protect, with a
  // clean translation that passes and one corruption per class that must fail.
  describe('comprehensive token preservation', () => {
    const SOURCE = [
      '---',
      'title: Config',
      'description: The `.env` file guide',
      '---',
      '',
      '# Setting up',
      '',
      'Set the `PORT` var and read the [setup guide](/docs/setup).',
      '',
      '```bash',
      'echo hi',
      '```',
      '',
      '<img src="https://img.test/a.png" alt="diagram" />',
      '',
      "<OptionTable options={[['HOST', 'string', 'Host, see `docker-compose.yml`.', 'x']]} />",
      '',
    ].join('\n')

    const GOOD = [
      '---',
      'title: Konfiguration',
      'description: Die `.env` Datei-Anleitung',
      '---',
      '',
      '# Einrichtung',
      '',
      'Setze die `PORT` Variable und lies die [Einrichtungsanleitung](/docs/setup).',
      '',
      '```bash',
      'echo hi',
      '```',
      '',
      '<img src="https://img.test/a.png" alt="Diagramm" />',
      '',
      "<OptionTable options={[['HOST', 'string', 'Host, siehe `docker-compose.yml`.', 'x']]} />",
      '',
    ].join('\n')

    it('accepts a translation that preserves every token class', () => {
      expect(validateTranslation(SOURCE, GOOD).ok).toBe(true)
    })

    const cases: Array<[string, string, RegExp]> = [
      ['inline code in frontmatter', GOOD.replace('`.env`', '`.umgebung`'), /inline code/i],
      ['inline code in prose', GOOD.replace('`PORT`', '`ANSCHLUSS`'), /inline code/i],
      ['markdown link target', GOOD.replace('/docs/setup', '/de/docs/x'), /link target/i],
      ['img src url', GOOD.replace('img.test/a.png', 'img.test/b.png'), /link target/i],
      [
        'code inside an OptionTable description',
        GOOD.replace('docker-compose.yml', 'docker-compose.umgebung.yml'),
        /inline code/i,
      ],
      ['dropped fenced block', GOOD.replace('```bash\necho hi\n```\n', ''), /code block/i],
      [
        'dropped frontmatter key',
        GOOD.replace('description: Die `.env` Datei-Anleitung\n', ''),
        /frontmatter/i,
      ],
    ]

    for (const [name, bad, pattern] of cases) {
      it(`rejects: ${name}`, () => {
        const result = validateTranslation(SOURCE, bad)
        expect(result.ok).toBe(false)
        expect(result.error).toMatch(pattern)
      })
    }
  })

  it('rejects a localized template placeholder, accepts a translation that keeps it', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['titlePromptTemplate', 'string', 'Must include {input} and {output} placeholders.', 'x']]} />\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['titlePromptTemplate', 'string', 'Muss die Platzhalter {input} und {output} enthalten.', 'x']]} />\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['titlePromptTemplate', 'string', 'Muss die Platzhalter {Eingabe} und {Ausgabe} enthalten.', 'x']]} />\n`
    expect(validateTranslation(src, good).ok).toBe(true)
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/template placeholder/i)
  })

  it('rejects a translation that swaps two placeholder positions', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['k', 'string', 'Format User: {input} AI: {output}', 'x']]} />\n`
    // Same placeholder multiset { {input}, {output} } but their positions swapped,
    // which documents an invalid prompt template.
    const bad = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['k', 'string', 'Format User: {output} AI: {input}', 'x']]} />\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/template placeholder/i)
  })

  it('rejects a localized ${env} interpolation in prose', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nSet the value to \${OPENROUTER_KEY} before start.\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\nSetze den Wert auf \${OPENROUTER_SCHLUESSEL} vor dem Start.\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/template placeholder/i)
  })

  it('rejects a localized {{handlebars}} user variable', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nThe value of {{LIBRECHAT_USER_ID}} is injected.\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\nDer Wert von {{LIBRECHAT_BENUTZER_ID}} wird eingefügt.\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/template placeholder/i)
  })

  it('does not flag a JSX style object as a placeholder change when prose is reworded', () => {
    // The {{...}} style object is verbatim, so it must stay identical and the
    // translation of surrounding prose must still validate.
    const src = `---\ntitle: T\ndescription: D\n---\n\n<div style={{ borderRadius: '10px' }}>\n\nSome text here.\n\n</div>\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\n<div style={{ borderRadius: '10px' }}>\n\nEtwas Text hier.\n\n</div>\n`
    expect(validateTranslation(src, good).ok).toBe(true)
  })

  it('accepts a translated heading but rejects one that loses its ATX marker', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n## What is RAG\n\nBody.\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\n## Was ist RAG\n\nKörper.\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\nWas ist RAG\n\nKörper.\n`
    expect(validateTranslation(src, good).ok).toBe(true)
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/heading level/i)
  })

  it('rejects a heading whose level changed', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n## Section\n\nBody.\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n### Abschnitt\n\nKörper.\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/heading level/i)
  })

  it('rejects a translation that swaps two link destinations', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nUse [Nginx](/docs/nginx) or [Traefik](/docs/traefik).\n`
    // Labels translated but destinations swapped: same URL multiset, wrong links.
    const bad = `---\ntitle: T\ndescription: D\n---\n\nVerwende [Nginx](/docs/traefik) oder [Traefik](/docs/nginx).\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/link target/i)
  })

  it('accepts a translation that keeps each link destination with its label', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nUse [Nginx](/docs/nginx) or [Traefik](/docs/traefik).\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\nVerwende [Nginx](/docs/nginx) oder [Traefik](/docs/traefik).\n`
    expect(validateTranslation(src, good).ok).toBe(true)
  })

  it('rejects a rewritten bare URL inside a JSX expression string', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['KEY', 'string', 'Get your key from https://serper.dev/api-key', '# KEY=']]} />\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['KEY', 'string', 'Hol deinen Schlüssel von https://serper.de/api-schluessel', '# KEY=']]} />\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/link target/i)
  })

  it('accepts a translated JSX description that preserves a bare URL', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['KEY', 'string', 'Get your key from https://serper.dev/api-key', '# KEY=']]} />\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\n<OptionTable options={[['KEY', 'string', 'Hol deinen Schlüssel von https://serper.dev/api-key', '# KEY=']]} />\n`
    expect(validateTranslation(src, good).ok).toBe(true)
  })

  it('ignores trailing sentence punctuation when prose around a bare URL is reworded', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\nGet your key from https://serper.dev/api-key.\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\nHol deinen Schlüssel von https://serper.dev/api-key!\n`
    expect(validateTranslation(src, good).ok).toBe(true)
  })

  it('accepts a faithfully translated table but rejects a dropped delimiter row', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n| Name | Description |\n|------|-------------|\n| host | The server host |\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\n| Name | Beschreibung |\n|------|-------------|\n| host | Der Server-Host |\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\nName: Beschreibung\nhost: Der Server-Host\n`
    expect(validateTranslation(src, good).ok).toBe(true)
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/table structure/i)
  })

  it('rejects a table whose body row loses a pipe even if the delimiter is intact', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n| A | B |\n|---|---|\n| x | y |\n`
    // Delimiter row unchanged, but the body row merged its two cells into one.
    const bad = `---\ntitle: T\ndescription: D\n---\n\n| A | B |\n|---|---|\n| xy |\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/table structure/i)
  })

  it('rejects a translation that swaps two heading depths', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n## Section\n\nText.\n\n### Subsection\n\nMore.\n`
    // Same level multiset { ##, ### } but the depths are swapped.
    const bad = `---\ntitle: T\ndescription: D\n---\n\n### Abschnitt\n\nText.\n\n## Unterabschnitt\n\nMore.\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/heading level/i)
  })

  it('accepts a faithfully translated blockquote but rejects dropped > markers', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n> **Note:** first line\n> second line\n> third line\n`
    const good = `---\ntitle: T\ndescription: D\n---\n\n> **Hinweis:** erste Zeile\n> zweite Zeile\n> dritte Zeile\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n> **Hinweis:** erste Zeile\nzweite Zeile\ndritte Zeile\n`
    expect(validateTranslation(src, good).ok).toBe(true)
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/blockquote marker/i)
  })

  it('rejects a rewritten src attribute URL on an HTML/JSX tag', () => {
    const src = `---\ntitle: T\ndescription: D\n---\n\n<img src="https://img.example.com/a.png?q=$.x%5B'en'%5D" alt="EN" />\n`
    const bad = `---\ntitle: T\ndescription: D\n---\n\n<img src="https://img.example.com/b.png?q=$.x%5B'de'%5D" alt="DE" />\n`
    const result = validateTranslation(src, bad)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/link target/i)
  })
})
