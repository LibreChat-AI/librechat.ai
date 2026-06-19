import matter from 'gray-matter'
import { countCodeFences } from './segment'

export function validateTranslation(source: string, output: string): { ok: boolean; error?: string } {
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

  const srcFences = countCodeFences(src.content)
  const outFences = countCodeFences(out.content)
  if (srcFences !== outFences) {
    return { ok: false, error: `code block count changed: ${srcFences} -> ${outFences}` }
  }

  return { ok: true }
}
