import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import { createHash } from 'node:crypto'
import { PROMPT_VERSION } from './config'

export type Segment =
  | { kind: 'verbatim'; text: string }
  // `jsQuote` is set when the value was extracted from a quoted JS/JSX string
  // literal (the enclosing quote char). The orchestrator unescapes it before
  // translation and re-escapes the result for that quote before reinserting it.
  | { kind: 'translatable'; text: string; hash: string; jsQuote?: string }

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMdx)

// Containers are recursed into so nested verbatim leaves (code, ESM, etc.) stay
// verbatim while their prose is still translated. MDX JSX flow elements
// (<Tabs>, <Steps>, <Callout>, ...) get their own branch in walk(): docs
// routinely place fenced shell/config commands inside them (which must stay
// verbatim) while also putting user-facing copy in display attributes like
// title= (which should be translated).
const CONTAINER_TYPES = new Set(['list', 'listItem', 'blockquote', 'footnoteDefinition'])

const TRANSLATABLE_TYPES = new Set(['paragraph', 'heading', 'table'])

// A JS string literal (single- or double-quoted) with escape handling, so values
// containing the other quote type or an escaped quote (e.g. 'the user\'s host')
// match correctly. The whole literal including its quotes is matched; callers
// strip the surrounding quotes to get the value. Used as the building block for
// every prop matcher below so the escape handling lives in one place.
const JS_STRING = String.raw`(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")`

// Attributes on JSX components that render as visible copy and should be
// translated. Structural/expression props and code-fence info strings (e.g.
// ```yaml title="librechat.yaml") are NOT touched: this only runs on JSX open
// tags, and the engine glossary still protects terms like Docker/MCP if they
// appear here. Group 2 is the quoted value.
const DISPLAY_PROP_RE = new RegExp(
  String.raw`(\b(?:title|label|summary|heading|alt)\s*=\s*)(${JS_STRING})`,
  'g',
)

// Whitelisted props whose value is an expression array of string literals, e.g.
// <Tabs items={['Welcome', 'Security Alert']}>. The individual labels are
// user-facing and should be translated while the array structure stays verbatim.
const ARRAY_PROP_RE = /(\b(?:items|labels)\s*=\s*\{\s*\[)([\s\S]*?)(\]\s*\})/g
const STRING_LITERAL_RE = new RegExp(JS_STRING, 'g')

// OptionTable's `options` prop is an array of [key, type, description] or
// [key, type, description, example] tuples; only the 3rd cell (Description) is
// visible prose to translate. Group 1 captures everything up to the description
// so its offset can be derived without the `d` flag (which needs an es2022
// target). Group 2 is the quoted description, which may be followed by a comma
// (4-cell) or the closing `]` (3-cell). Rows whose description is JSX or not a
// string literal won't match and stay verbatim.
const OPTIONS_PROP_RE = /(\boptions\s*=\s*\{\s*\[)([\s\S]*?)(\]\s*\})/g
const OPTIONS_ROW_RE = new RegExp(
  String.raw`(\[\s*${JS_STRING}\s*,\s*${JS_STRING}\s*,\s*)(${JS_STRING})\s*(?:,|\])`,
  'g',
)

export function hashText(text: string): string {
  return createHash('sha256').update(`${PROMPT_VERSION}\n${text}`).digest('hex').slice(0, 16)
}

const EXPLICIT_ID_RE = /\s*\[#[^\]]+\]\s*$/

/** Whether a block is an ATX heading (`# ...` through `###### ...`). */
export function isHeading(text: string): boolean {
  return /^#{1,6}\s/.test(text)
}

/** Whether a heading already carries an explicit `[#id]` (Fumadocs custom id). */
export function headingHasExplicitId(text: string): boolean {
  return EXPLICIT_ID_RE.test(text)
}

/** The slug source text of a heading: marker and any trailing `[#id]` removed. */
export function headingText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/, '')
    .replace(EXPLICIT_ID_RE, '')
    .trim()
}

// A heading whose text is a single bare code token: a config/API name, env var,
// file name, or header such as `enforce`, `addedEndpoints`, `.env`,
// `AZURE_AI_SEARCH_API_KEY`, `Content-Security-Policy`, or `OAuth2`. Two shapes
// qualify, and both must be a single whitespace-free token:
//   1. A lowercase/underscore-led identifier (camelCase, snake_case, dotted) —
//      these read as plain words but the lowercase start marks them as code
//      (prose headings are Title-Case: Overview, System Options).
//   2. Any token built only from identifier and separator characters
//      (letters, digits and `_ . - = : / + %`) that is NOT a plain alphabetic
//      word — this catches Title-Case headers and ALL_CAPS env vars.
// Plain words (Overview), emphasised prose (`**Overview**`, which carries `*`),
// and multi-word headings are all translated. The second shape requires at least
// one letter so pure numbers/punctuation never qualify. Backtick-wrapped code
// headings (`` `apiKey` ``) are left to the inline-code validation guard.
const LOWER_IDENTIFIER_RE = /^[a-z_$][\w$.]*$/
const CODE_TOKEN_RE = /^(?=[\w.=:/+%-]*[A-Za-z])[\w.=:/+%-]+$/
const PLAIN_WORD_RE = /^[A-Za-z]+$/

/** Whether a heading is a bare code identifier that should stay verbatim. */
export function isIdentifierHeading(text: string): boolean {
  if (!isHeading(text)) return false
  const t = headingText(text)
  return LOWER_IDENTIFIER_RE.test(t) || (CODE_TOKEN_RE.test(t) && !PLAIN_WORD_RE.test(t))
}

/**
 * Decode the escaped enclosing quote (`\'` in a single-quoted literal, `\"` in a
 * double-quoted one) of a value extracted from a quoted JS string literal, so the
 * model translates a natural apostrophe/quote rather than escape syntax. Every
 * other escape (`\\`, `\n`, `\t`, `\uXXXX`, ...) is left byte-for-byte intact and
 * matched atomically, so escapeJsString restores it exactly; decoding `\\` here
 * would be irreversible since a re-escape could not tell a literal backslash from
 * the lead byte of a `\n` sequence.
 */
export function unescapeJsString(value: string, quote: string): string {
  return value.replaceAll(/\\[\s\S]/g, (m) => (m[1] === quote ? quote : m))
}

/**
 * Re-escape a translated value for reinsertion inside a `quote`-delimited JS
 * string: a bare enclosing quote (e.g. an apostrophe a French translation adds
 * inside a single-quoted OptionTable row) becomes `\'`, so it cannot break the
 * generated MDX. Existing escape sequences are matched atomically and preserved
 * verbatim, so a literal `\\` or `\n` is neither doubled nor stripped.
 */
export function escapeJsString(value: string, quote: string): string {
  return value.replaceAll(/\\[\s\S]|[\s\S]/g, (m) => (m === quote ? `\\${quote}` : m))
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
    // m[2] is the quoted value; skip its opening/closing quotes.
    const start = (m.index ?? 0) + m[1].length + 1
    ranges.push([start, start + m[2].length - 2])
  }
  for (const m of span.matchAll(ARRAY_PROP_RE)) {
    const innerOffset = (m.index ?? 0) + m[1].length
    for (const lit of m[2].matchAll(STRING_LITERAL_RE)) {
      // lit[0] is the whole quoted literal; skip its opening/closing quotes.
      const start = innerOffset + (lit.index ?? 0) + 1
      ranges.push([start, start + lit[0].length - 2])
    }
  }
  for (const m of span.matchAll(OPTIONS_PROP_RE)) {
    const innerOffset = (m.index ?? 0) + m[1].length
    for (const row of m[2].matchAll(OPTIONS_ROW_RE)) {
      // row[1] is the prefix up to the description; row[2] is the quoted
      // description. Skip the opening/closing quotes for the value range.
      const descStart = innerOffset + (row.index ?? 0) + row[1].length + 1
      ranges.push([descStart, descStart + row[2].length - 2])
    }
  }
  ranges.sort((a, b) => a[0] - b[0])

  let last = 0
  for (const [start, end] of ranges) {
    if (start < last) continue // ignore any overlap
    if (start > last) segments.push({ kind: 'verbatim', text: span.slice(last, start) })
    const value = span.slice(start, end)
    if (value && /\p{L}/u.test(value)) {
      // Every range here is a JS string value, so the char just before it is the
      // enclosing quote — record it so the orchestrator can re-escape correctly.
      segments.push({
        kind: 'translatable',
        text: value,
        hash: hashText(value),
        jsQuote: span[start - 1],
      })
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
      // Translate blocks with actual letters (skips self-closing components,
      // separators, etc.), except headings that are a bare code identifier (a
      // config/API name like `### enforce`), which must stay verbatim.
      const translatable =
        TRANSLATABLE_TYPES.has(node.type) &&
        /\p{L}/u.test(raw) &&
        !(node.type === 'heading' && isIdentifierHeading(raw))
      if (translatable) {
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
 * Collect every inline code span (`like-this`) anywhere in the text. Fenced code
 * blocks are stripped first (they are verbatim and validated separately by
 * count), then single-backtick spans are scanned from the RAW text rather than
 * the Markdown AST. Raw scanning is deliberate: it also catches identifiers that
 * ride inside JSX expression/attribute string literals (e.g. an OptionTable
 * description like `docker-compose.override.yml`), which the AST does not expose
 * as inlineCode nodes. Used to verify the model preserved those identifiers.
 */
export function collectInlineCode(body: string): string[] {
  const withoutFences = body.replaceAll(/```[\s\S]*?```/g, '').replaceAll(/~~~[\s\S]*?~~~/g, '')
  const out: string[] = []
  for (const m of withoutFences.matchAll(/`([^`\n]+)`/g)) out.push(m[1])
  return out
}

// src/href destinations on HTML/JSX tags (e.g. <img src="...">, <a href="...">),
// which are not Markdown link/image nodes. The backreferenced closing quote keeps
// quotes of the other type inside the URL (common in badge URLs) from terminating
// the match.
const ATTR_URL_RE = /\b(?:src|href)\s*=\s*(["'])([\s\S]*?)\1/gi

// Markdown link/image destination, scanned from raw text: [text](url) / ![alt](url).
// This catches links embedded in JSX string props (e.g. an OptionTable description
// like 'see [params](#default-parameters)'), which the AST exposes only as opaque
// expression text. The first token after `](` is the destination (a title or `)`
// ends it).
const MD_LINK_URL_RE = /\]\(\s*([^)\s]+)/g

// A bare http(s) URL not wrapped in Markdown link syntax or an attribute, e.g. a
// `Get your key from https://serper.dev/api-key` OptionTable description. The AST
// autolinks bare URLs only in plain prose, never inside JSX expression strings, so
// scan the raw (fence-stripped) text. Trailing sentence punctuation is trimmed (see
// the collector) so reworded prose around an unchanged URL is not read as a change.
const BARE_URL_RE = /\bhttps?:\/\/[^\s<>()[\]"'`]+/gi

/**
 * Collect every destination URL anywhere in the body, in document order: Markdown
 * link/image/definition targets (AST) plus src/href attributes and raw Markdown
 * link destinations (so links inside JSX string props are covered too). Used to
 * verify the model did not rewrite or localize a URL; link text and alt text ride
 * inside translatable prose and are translated, but the destination must survive
 * verbatim. Body links are caught by both the AST walk and the raw scan, which is
 * harmless: the duplication is identical in source and output.
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
  const withoutFences = body.replaceAll(/```[\s\S]*?```/g, '').replaceAll(/~~~[\s\S]*?~~~/g, '')
  for (const m of withoutFences.matchAll(ATTR_URL_RE)) out.push(m[2])
  for (const m of withoutFences.matchAll(MD_LINK_URL_RE)) out.push(m[1])
  for (const m of withoutFences.matchAll(BARE_URL_RE)) out.push(m[0].replace(/[.,;:!?]+$/, ''))
  return out
}

// Template placeholders that must survive translation byte-for-byte. They appear
// bare (outside backticks) in OptionTable descriptions and prose, e.g. a
// titlePromptTemplate `"User: {input}\nAI: {output}"`, an MCP env value
// `${SOME_API_KEY}`, or a LibreChat user variable `{{LIBRECHAT_USER_ID}}`;
// localizing a placeholder name yields an invalid template. Three forms, tried in
// order so the longer ones win and the inner braces are not re-matched:
//   - `${name}`  JS template-literal / env interpolation
//   - `{{name}}` mustache/handlebars (LibreChat user vars, MCP templating, also
//     matches JSX `style={{...}}` objects, which are verbatim and thus symmetric)
//   - `{name}`   single-brace identifier placeholder. The body is restricted to an
//     identifier so JSX expression arrays/objects whose inner strings are
//     translated (`items={['Welcome']}`) are never captured.
const PLACEHOLDER_RE = /\$\{[^{}\n]+\}|\{\{[^{}\n]+\}\}|\{\s*[A-Za-z_$][\w.$]*\s*\}/g

/**
 * Collect every bare template placeholder in the body, in document order. Fenced
 * code is stripped first (verbatim and count-checked separately). Used to verify
 * the model did not translate or rewrite a placeholder name inside otherwise
 * translatable text; backticked placeholders are already covered as inline code.
 */
export function collectPlaceholders(body: string): string[] {
  const withoutFences = body.replaceAll(/```[\s\S]*?```/g, '').replaceAll(/~~~[\s\S]*?~~~/g, '')
  const out: string[] = []
  for (const m of withoutFences.matchAll(PLACEHOLDER_RE)) out.push(m[0])
  return out
}

const SEPARATOR = /^---(.+)---$/
// A `pages` entry that is a Markdown link, e.g. "[Contributor Guidelines](url)".
// The visible label is translated; the URL is preserved.
const META_LINK = /^\[(.+)\]\((.+)\)$/

export function extractMetaStrings(meta: unknown): string[] {
  const out: string[] = []
  if (meta && typeof meta === 'object') {
    const m = meta as { title?: unknown; pages?: unknown }
    if (typeof m.title === 'string') out.push(m.title)
    if (Array.isArray(m.pages)) {
      for (const p of m.pages) {
        if (typeof p === 'string') {
          const sep = p.match(SEPARATOR)
          if (sep) {
            out.push(sep[1].trim())
            continue
          }
          const link = p.match(META_LINK)
          if (link) out.push(link[1])
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
        const sep = p.match(SEPARATOR)
        if (sep) return `---${translate(sep[1].trim())}---`
        const link = p.match(META_LINK)
        if (link) return `[${translate(link[1])}](${link[2]})`
      }
      return p
    })
  }
  return out
}
