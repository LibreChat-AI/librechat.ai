import matter from 'gray-matter'
import {
  countCodeFences,
  collectInlineCode,
  collectUrls,
  collectPlaceholders,
  collectBlockStructure,
} from './segment'

/**
 * Body content plus translatable frontmatter values (title/description), so
 * tokens inside frontmatter are checked too — those values are sent to the model
 * as inline text just like prose.
 */
function corpus(file: matter.GrayMatterFile<string>): string {
  const parts = [file.content]
  for (const key of ['title', 'description']) {
    const value = file.data[key]
    if (typeof value === 'string') parts.push(value)
  }
  return parts.join('\n\n')
}

/**
 * The complete set of token classes that must survive translation byte-for-byte,
 * each as a sorted multiset over the corpus. Translation may reword and reorder
 * prose, but must not add, drop, or alter any of these. This is the single place
 * that defines "what the model is not allowed to touch":
 *
 * - `inline code`: every `backtick span`, scanned from raw text (after stripping
 *   fenced blocks) so identifiers inside JSX expression/attribute strings and
 *   frontmatter are covered, not just Markdown AST nodes.
 * - `link target`: every Markdown link/image/definition destination plus every
 *   src/href attribute URL on an HTML/JSX tag.
 * - `template placeholder`: every bare `{name}`, `{{name}}`, or `${name}` token,
 *   so a placeholder name (e.g. a prompt template `{input}`/`{output}` or an env
 *   var `${API_KEY}`) is not localized into an invalid template.
 * - `table structure` / `blockquote marker`: GFM table delimiter rows and `>`
 *   markers, so a translation can't silently collapse a table or eject lines from
 *   a blockquote (the table/blockquote text rides inside one translatable block).
 *
 * Fenced code blocks are preserved structurally (verbatim segments) and only
 * count-checked here; JSX tags/structural props and heading ids are likewise
 * handled in segmentation, not by this guard.
 */
function preservedTokens(text: string): Record<string, string[]> {
  const structure = collectBlockStructure(text)
  return {
    'inline code': collectInlineCode(text).sort(),
    'link target': collectUrls(text).sort(),
    'template placeholder': collectPlaceholders(text).sort(),
    'table structure': structure.tables.sort(),
    'blockquote marker': structure.quotes.sort(),
  }
}

function sameMultiset(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i])
}

export function validateTranslation(
  source: string,
  output: string,
): { ok: boolean; error?: string } {
  let src: matter.GrayMatterFile<string>
  let out: matter.GrayMatterFile<string>
  try {
    src = matter(source)
  } catch (e) {
    return { ok: false, error: `source frontmatter parse error: ${(e as Error).message}` }
  }
  try {
    out = matter(output)
  } catch (e) {
    return { ok: false, error: `output frontmatter parse error: ${(e as Error).message}` }
  }

  const srcKeys = Object.keys(src.data).sort().join(',')
  const outKeys = Object.keys(out.data).sort().join(',')
  if (srcKeys !== outKeys) {
    return { ok: false, error: `frontmatter keys changed: [${srcKeys}] -> [${outKeys}]` }
  }

  let srcFences: number
  let outFences: number
  let srcTokens: Record<string, string[]>
  let outTokens: Record<string, string[]>
  try {
    srcFences = countCodeFences(src.content)
    outFences = countCodeFences(out.content)
    srcTokens = preservedTokens(corpus(src))
    outTokens = preservedTokens(corpus(out))
  } catch (e) {
    return { ok: false, error: `output is not parseable MDX: ${(e as Error).message}` }
  }

  if (srcFences !== outFences) {
    return { ok: false, error: `code block count changed: ${srcFences} -> ${outFences}` }
  }

  for (const label of Object.keys(srcTokens)) {
    if (!sameMultiset(srcTokens[label], outTokens[label])) {
      return {
        ok: false,
        error: `${label} changed: [${srcTokens[label].join(', ')}] -> [${outTokens[label].join(', ')}]`,
      }
    }
  }

  return { ok: true }
}
