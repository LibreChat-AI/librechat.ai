import matter from 'gray-matter'
import { countCodeFences, collectInlineCode, collectUrls } from './segment'

/**
 * Body content plus translatable frontmatter values (title/description), so code
 * spans and link targets inside frontmatter are checked too — those values are
 * sent to the model as inline text just like prose.
 */
function corpus(file: matter.GrayMatterFile<string>): string {
  const parts = [file.content]
  for (const key of ['title', 'description']) {
    const value = file.data[key]
    if (typeof value === 'string') parts.push(value)
  }
  return parts.join('\n\n')
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

  const srcCorpus = corpus(src)
  const outCorpus = corpus(out)

  let srcFences: number
  let outFences: number
  let srcInline: string[]
  let outInline: string[]
  let srcUrls: string[]
  let outUrls: string[]
  try {
    srcFences = countCodeFences(src.content)
    outFences = countCodeFences(out.content)
    srcInline = collectInlineCode(srcCorpus).sort()
    outInline = collectInlineCode(outCorpus).sort()
    srcUrls = collectUrls(srcCorpus).sort()
    outUrls = collectUrls(outCorpus).sort()
  } catch (e) {
    return { ok: false, error: `output is not parseable MDX: ${(e as Error).message}` }
  }
  if (srcFences !== outFences) {
    return { ok: false, error: `code block count changed: ${srcFences} -> ${outFences}` }
  }

  // Inline identifiers (env vars, config keys, template tokens) must survive
  // verbatim; reject if the model localized, dropped, or added one.
  if (
    srcInline.length !== outInline.length ||
    srcInline.some((value, i) => value !== outInline[i])
  ) {
    return {
      ok: false,
      error: `inline code changed: [${srcInline.join(', ')}] -> [${outInline.join(', ')}]`,
    }
  }

  // Link/image destinations must survive verbatim; reject if a URL was rewritten,
  // localized, dropped, or added.
  if (srcUrls.length !== outUrls.length || srcUrls.some((value, i) => value !== outUrls[i])) {
    return {
      ok: false,
      error: `link target changed: [${srcUrls.join(', ')}] -> [${outUrls.join(', ')}]`,
    }
  }

  return { ok: true }
}
