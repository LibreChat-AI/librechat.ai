import matter from 'gray-matter'
import {
  countCodeFences,
  collectInlineCode,
  collectUrls,
  collectRawUrls,
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
 * - `table structure` / `blockquote marker` / `heading level`: per-table column
 *   and per-row cell shape (from the AST), `>` markers, and ATX heading levels, so
 *   a translation can't silently break a table (drop/merge a pipe in any row),
 *   eject lines from a blockquote, or drop/alter a heading marker (losing the
 *   heading, its TOC entry, and its pinned anchor).
 *
 * Fenced code blocks are preserved structurally (verbatim segments) and only
 * count-checked here; JSX tags/structural props and heading ids are likewise
 * handled in segmentation, not by this guard.
 *
 * `link target`, `heading level`, and `template placeholder` are intentionally NOT
 * sorted: they are compared in document order so a translation that swaps two link
 * destinations between their labels, swaps two heading depths, or swaps two
 * placeholder positions (e.g. `User: {input}\nAI: {output}` → `User: {output}\nAI:
 * {input}`) — same multiset, broken meaning — is rejected. The other classes are
 * sorted, tolerating benign reordering since position is not load-bearing for them.
 */
function preservedTokens(text: string): Record<string, string[]> {
  const structure = collectBlockStructure(text)
  return {
    'inline code': collectInlineCode(text).sort(),
    'link target': collectUrls(text),
    'template placeholder': collectPlaceholders(text),
    'table structure': structure.tables.sort(),
    'blockquote marker': structure.quotes.sort(),
    'heading level': structure.headings,
  }
}

function preservedInlineTokens(text: string): Record<string, string[]> {
  return {
    'inline code': collectInlineCode(text).sort(),
    'link target': collectRawUrls(text),
    'template placeholder': collectPlaceholders(text),
    'table structure': [],
    'blockquote marker': [],
    'heading level': [],
  }
}

function sameMultiset(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i])
}

function validatePreservedParts(
  sourceFenceText: string,
  outputFenceText: string,
  sourceTokenText = sourceFenceText,
  outputTokenText = outputFenceText,
): { ok: boolean; error?: string } {
  let srcFences: number
  let outFences: number
  let srcTokens: Record<string, string[]>
  let outTokens: Record<string, string[]>
  try {
    srcFences = countCodeFences(sourceFenceText)
    outFences = countCodeFences(outputFenceText)
    srcTokens = preservedTokens(sourceTokenText)
    outTokens = preservedTokens(outputTokenText)
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

function validatePreservedInlineParts(
  source: string,
  output: string,
): { ok: boolean; error?: string } {
  const srcTokens = preservedInlineTokens(source)
  const outTokens = preservedInlineTokens(output)

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

/**
 * Validate a single translated markdown/MDX fragment before it is cached. Long
 * docs pages are assembled from many independently translated blocks; catching a
 * bad block here lets the runner retry or fall back to the source block instead
 * of rejecting the entire file after all other blocks have succeeded.
 */
export function validatePreservedText(
  source: string,
  output: string,
  kind: 'block' | 'inline' = 'block',
): { ok: boolean; error?: string } {
  if (kind === 'inline') return validatePreservedInlineParts(source, output)
  return validatePreservedParts(source, output)
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

  return validatePreservedParts(src.content, out.content, corpus(src), corpus(out))
}
