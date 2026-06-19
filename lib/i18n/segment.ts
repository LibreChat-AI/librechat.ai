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

const CONTAINER_TYPES = new Set(['list', 'listItem', 'blockquote', 'footnoteDefinition'])

const TRANSLATABLE_TYPES = new Set(['paragraph', 'heading', 'table', 'mdxJsxFlowElement'])

export function hashText(text: string): string {
  return createHash('sha256').update(`${PROMPT_VERSION}\n${text}`).digest('hex').slice(0, 16)
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
