import { describe, it, expect } from 'vitest'
import { validateTranslation } from './validate'

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
})
