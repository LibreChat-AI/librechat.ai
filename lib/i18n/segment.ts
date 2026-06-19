import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import { createHash } from 'node:crypto'
import { PROMPT_VERSION } from './config'

export type Segment =
  | { kind: 'verbatim'; text: string }
  | { kind: 'translatable'; text: string; hash: string }

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)

// Containers are recursed into so nested verbatim leaves (code, ESM, etc.) stay
// verbatim while their prose is still translated. MDX JSX flow elements
// (<Tabs>, <Steps>, <Callout>, ...) get their own branch in walk(): docs
// routinely place fenced shell/config commands inside them (which must stay
// verbatim) while also putting user-facing copy in display attributes like
// title= (which should be translated).
const CONTAINER_TYPES = new Set(['list', 'listItem', 'blockquote', 'footnoteDefinition'])

const TRANSLATABLE_TYPES = new Set(['paragraph', 'heading', 'table'])

// Attributes on JSX components that render as visible copy and should be
// translated. Structural/expression props and code-fence info strings (e.g.
// ```yaml title="librechat.yaml") are NOT touched: this only runs on JSX open
// tags, and the engine glossary still protects terms like Docker/MCP if they
// appear here.
const DISPLAY_PROP_RE = /(\b(?:title|label|summary|heading)\s*=\s*)(["'])([^"']*)\2/g

// Whitelisted props whose value is an expression array of string literals, e.g.
// <Tabs items={['Welcome', 'Security Alert']}>. The individual labels are
// user-facing and should be translated while the array structure stays verbatim.
const ARRAY_PROP_RE = /(\b(?:items|labels)\s*=\s*\{\s*\[)([\s\S]*?)(\]\s*\})/g
const STRING_LITERAL_RE = /(["'])([^"']*)\1/g

export function hashText(text: string): string {
  return createHash('sha256').update(`${PROMPT_VERSION}\n${text}`).digest('hex').slice(0, 16)
}

/**
 * Emit segments for a JSX open-tag span, splitting whitelisted display-prop
 * values (quoted scalars and string literals inside whitelisted expression
 * arrays) into translatable segments while keeping the rest verbatim.
 * Reassembling the emitted segments yields the original span byte-for-byte.
 */
function emitTagSpan(span: string, segments: Segment[]): void {
  // Collect [start, end) ranges of translatable attribute values within the tag.
  const ranges: Array<[number, number]> = []
  for (const m of span.matchAll(DISPLAY_PROP_RE)) {
    const start = (m.index ?? 0) + m[1].length + 1 // +1 for the opening quote
    ranges.push([start, start + m[3].length])
  }
  for (const m of span.matchAll(ARRAY_PROP_RE)) {
    const innerOffset = (m.index ?? 0) + m[1].length
    for (const lit of m[2].matchAll(STRING_LITERAL_RE)) {
      const start = innerOffset + (lit.index ?? 0) + 1 // +1 for the opening quote
      ranges.push([start, start + lit[2].length])
    }
  }
  ranges.sort((a, b) => a[0] - b[0])

  let last = 0
  for (const [start, end] of ranges) {
    if (start < last) continue // ignore any overlap
    if (start > last) segments.push({ kind: 'verbatim', text: span.slice(last, start) })
    const value = span.slice(start, end)
    if (value && /\p{L}/u.test(value)) {
      segments.push({ kind: 'translatable', text: value, hash: hashText(value) })
    } else if (value) {
      segments.push({ kind: 'verbatim', text: value })
    }
    last = end
  }
  if (last < span.length) {
    segments.push({ kind: 'verbatim', text: span.slice(last) })
  }
}

interface MdNode {
  type: string
  children?: MdNode[]
  position?: { start: { offset?: number }; end: { offset?: number } }
}

function walk(nodes: MdNode[], body: string, segments: Segment[], cursor: { value: number }): void {
  for (const node of nodes) {
    const start = node.position?.start.offset
    const end = node.position?.end.offset
    if (start === undefined || end === undefined) continue

    if (start > cursor.value) {
      segments.push({ kind: 'verbatim', text: body.slice(cursor.value, start) })
    }
    cursor.value = start

    if (node.type === 'mdxJsxFlowElement') {
      // Open tag runs from the element start to its first child (or to the end
      // for childless/self-closing elements). Split display props out of it,
      // then recurse so nested code/prose are handled normally.
      const childOffsets = (node.children ?? [])
        .map((c) => c.position?.start.offset)
        .filter((o): o is number => o !== undefined)
      const openEnd = childOffsets.length > 0 ? Math.min(...childOffsets) : end
      emitTagSpan(body.slice(start, openEnd), segments)
      cursor.value = openEnd
      if (node.children && node.children.length > 0) {
        walk(node.children, body, segments, cursor)
        if (end > cursor.value) {
          segments.push({ kind: 'verbatim', text: body.slice(cursor.value, end) })
        }
        cursor.value = end
      }
      continue
    }

    if (CONTAINER_TYPES.has(node.type) && node.children && node.children.length > 0) {
      walk(node.children, body, segments, cursor)
      if (end > cursor.value) {
        segments.push({ kind: 'verbatim', text: body.slice(cursor.value, end) })
      }
      cursor.value = end
    } else {
      const raw = body.slice(start, end)
      // Only translate blocks that contain actual letters (skips self-closing
      // components, separators, etc.).
      if (TRANSLATABLE_TYPES.has(node.type) && /\p{L}/u.test(raw)) {
        segments.push({ kind: 'translatable', text: raw, hash: hashText(raw) })
      } else {
        segments.push({ kind: 'verbatim', text: raw })
      }
      cursor.value = end
    }
  }
}

/** Split MDX body (no frontmatter) into ordered segments, preserving all bytes. */
export function segmentMarkdown(body: string): Segment[] {
  const tree = processor.parse(body) as unknown as { children: MdNode[] }
  const segments: Segment[] = []
  const cursor = { value: 0 }
  walk(tree.children, body, segments, cursor)
  if (cursor.value < body.length) {
    segments.push({ kind: 'verbatim', text: body.slice(cursor.value) })
  }
  return segments
}

export function reassemble(segments: { text: string }[]): string {
  return segments.map((s) => s.text).join('')
}

export function countCodeFences(body: string): number {
  const tree = processor.parse(body) as unknown as { children: MdNode[] }
  return tree.children.filter((n) => n.type === 'code').length
}

/**
 * Collect every inline code span (`like-this`) anywhere in the body, in document
 * order. Used to verify the model preserved identifiers (env vars, config keys,
 * template tokens) verbatim, since inline code rides along inside translatable
 * prose blocks rather than being its own verbatim segment.
 */
export function collectInlineCode(body: string): string[] {
  const tree = processor.parse(body) as unknown as MdNode & { value?: string }
  const out: string[] = []
  const visit = (node: MdNode & { value?: string }) => {
    if (node.type === 'inlineCode' && typeof node.value === 'string') out.push(node.value)
    if (node.children)
      for (const child of node.children) visit(child as MdNode & { value?: string })
  }
  visit(tree)
  return out
}

// src/href destinations on HTML/JSX tags (e.g. <img src="...">, <a href="...">),
// which are not Markdown link/image nodes. The backreferenced closing quote keeps
// quotes of the other type inside the URL (common in badge URLs) from terminating
// the match.
const ATTR_URL_RE = /\b(?:src|href)\s*=\s*(["'])([\s\S]*?)\1/gi

/**
 * Collect every destination URL anywhere in the body, in document order:
 * Markdown link/image/definition targets plus src/href attributes on HTML/JSX
 * tags. Used to verify the model did not rewrite or localize a URL; link text and
 * alt text ride inside translatable prose and are translated, but the destination
 * must survive verbatim.
 */
export function collectUrls(body: string): string[] {
  const tree = processor.parse(body) as unknown as MdNode & { url?: string }
  const out: string[] = []
  const visit = (node: MdNode & { url?: string }) => {
    if (
      (node.type === 'link' || node.type === 'image' || node.type === 'definition') &&
      typeof node.url === 'string'
    ) {
      out.push(node.url)
    }
    if (node.children) for (const child of node.children) visit(child as MdNode & { url?: string })
  }
  visit(tree)
  for (const m of body.matchAll(ATTR_URL_RE)) out.push(m[2])
  return out
}

const SEPARATOR = /^---(.+)---$/

export function extractMetaStrings(meta: unknown): string[] {
  const out: string[] = []
  if (meta && typeof meta === 'object') {
    const m = meta as { title?: unknown; pages?: unknown }
    if (typeof m.title === 'string') out.push(m.title)
    if (Array.isArray(m.pages)) {
      for (const p of m.pages) {
        if (typeof p === 'string') {
          const match = p.match(SEPARATOR)
          if (match) out.push(match[1].trim())
        }
      }
    }
  }
  return out
}

export function rebuildMeta(meta: unknown, translate: (original: string) => string): unknown {
  if (!meta || typeof meta !== 'object') return meta
  const m = meta as { title?: unknown; pages?: unknown }
  const out: Record<string, unknown> = { ...(m as Record<string, unknown>) }
  if (typeof m.title === 'string') out.title = translate(m.title)
  if (Array.isArray(m.pages)) {
    out.pages = m.pages.map((p) => {
      if (typeof p === 'string') {
        const match = p.match(SEPARATOR)
        if (match) return `---${translate(match[1].trim())}---`
      }
      return p
    })
  }
  return out
}
