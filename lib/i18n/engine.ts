import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { OPENROUTER_APP_HEADERS } from '../openrouter-attribution'
import { GLOSSARY, TRANSLATE_MODEL, TRANSLATE_PROVIDER, TRANSLATE_SERVICE_TIER } from './config'
import { LOCALE_NAMES } from '../i18n'
import { withRetry } from './retry'
import { progress } from './progress'

export interface TranslateModel {
  generate(input: { system: string; prompt: string; maxOutputTokens?: number }): Promise<string>
}

/**
 * Output budget for one block. Without it the provider reserves its full context
 * window (65536 tokens) per request no matter how small the block is, which both
 * inflates the credit reservation — the pipeline died for three weeks on
 * "requires more credits, or fewer max_tokens... you requested up to 65536" — and
 * lets a looping model run far past any plausible translation.
 *
 * A translation runs longer than its source in most target languages, and CJK
 * tokenizes at roughly one token per character, so budget 3x the source length in
 * characters. The floor covers short inline strings.
 *
 * The ceiling is sized off the real corpus: the largest translatable segment in
 * content/docs is ~15k characters, which needs roughly 6k output tokens in the
 * worst-case target language, so 16384 leaves ample headroom while staying 4x
 * below the provider's default reservation. Truncation is not silent either way —
 * a length-limited finish is rejected below.
 */
export function outputTokenBudget(text: string): number {
  return Math.min(16384, Math.max(512, text.length * 3))
}

/**
 * Raised when the provider stopped at the token budget. Distinct from a provider
 * or network error because the two need opposite handling: a network blip should
 * be retried at the file level indefinitely, but truncation is deterministic for a
 * given block, so the runner counts it as a block validation failure and lets the
 * bounded give-up path keep that block in English. Treated as transient instead,
 * it would be re-paid on every file round and every scheduled run, forever.
 */
export class TruncatedOutputError extends Error {
  constructor(maxOutputTokens?: number) {
    super(`translation truncated at the ${maxOutputTokens ?? 'default'}-token budget`)
    this.name = 'TruncatedOutputError'
  }
}

/**
 * A response cut off at the token budget is not a translation. Its text can still
 * satisfy the structural validator — a truncated paragraph or heading usually
 * does, and so does a looping response that simply filled the cap — so without
 * this it would be cached and published as if it were complete.
 */
export function assertNotTruncated(finishReason: string, maxOutputTokens?: number): void {
  if (finishReason === 'length') {
    throw new TruncatedOutputError(maxOutputTokens)
  }
}

export function createOpenRouterModel(): TranslateModel {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: OPENROUTER_APP_HEADERS,
  })
  // Pin the provider via OpenRouter's routing preferences; `service_tier` is not a
  // typed setting, so pass it through `extraBody` (merged verbatim into the request
  // body and forwarded to the upstream provider).
  const model = openrouter.chat(TRANSLATE_MODEL, {
    provider: { only: [TRANSLATE_PROVIDER] },
    extraBody: { service_tier: TRANSLATE_SERVICE_TIER },
  })
  // The `flex` tier returns 429s under load. Retry with backoff (honoring any
  // Retry-After) so a single workflow run converges instead of skipping most pages
  // and needing repeated manual re-runs. SDK-level retries are disabled so the
  // backoff lives in one place; TRANSLATE_MAX_RETRIES tunes the budget in CI.
  const maxRetries = Number(process.env.TRANSLATE_MAX_RETRIES) || 6
  return {
    async generate({ system, prompt, maxOutputTokens }) {
      const { text, finishReason } = await withRetry(
        () =>
          generateText({ model, system, prompt, temperature: 0.2, maxRetries: 0, maxOutputTokens }),
        {
          retries: maxRetries,
          // Backoff is routine on the flex tier: count it for the progress UI
          // instead of emitting a log line per attempt (that spam buried the
          // signal in CI). A retry that ultimately exhausts its budget still
          // surfaces — its error rides up to run.ts and into `skipped`.
          onRetry: () => progress.retry(),
        },
      )
      assertNotTruncated(finishReason, maxOutputTokens)
      return text
    },
  }
}

export function buildSystemPrompt(localeName: string, kind: 'block' | 'inline'): string {
  return [
    `You are a professional technical translator translating LibreChat documentation into ${localeName}.`,
    '',
    'Rules:',
    `- Translate prose, headings, list and table text, link text, and alt text into ${localeName}.`,
    '- Preserve EXACTLY, untranslated: code (fenced and inline), JSX/MDX tags and all their props/attributes, import/export statements, URLs and file paths, anchor ids, frontmatter keys, and HTML attributes.',
    '- Preserve all Markdown/MDX syntax and structure: same headings levels, same list markers, same number of code blocks, same components.',
    kind === 'inline'
      ? '- This is a short inline string (a title or label). Return a single line with no surrounding Markdown.'
      : '- Return the translated Markdown/MDX block only.',
    '- Output ONLY the translation. No explanations, no commentary, no surrounding code fences.',
    `- Never translate these terms (keep them exactly as written): ${GLOSSARY.join(', ')}.`,
  ].join('\n')
}

export function stripWrappingFence(s: string): string {
  const match = s.match(/^\s*```[a-zA-Z0-9]*\n([\s\S]*?)\n```\s*$/)
  if (!match) return s
  // If the captured body still contains a fence, the regex spanned two or more
  // real code blocks (the model returned fenced content, not a wrapper). Leave it
  // untouched rather than corrupting the interior block.
  if (match[1].includes('```')) return s
  return match[1]
}

export async function translate(opts: {
  text: string
  locale: string
  kind: 'block' | 'inline'
  context?: string
  model: TranslateModel
}): Promise<string> {
  const localeName = LOCALE_NAMES[opts.locale] ?? opts.locale
  const system = buildSystemPrompt(localeName, opts.kind)
  const context = opts.context
    ? `Surrounding context (for reference only, DO NOT translate or include in your output):\n${opts.context}\n\n`
    : ''
  const prompt = `${context}Translate the following into ${localeName}:\n${opts.text}`
  const raw = await opts.model.generate({
    system,
    prompt,
    maxOutputTokens: outputTokenBudget(opts.text),
  })
  return stripWrappingFence(raw)
}
