import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { GLOSSARY, TRANSLATE_MODEL, TRANSLATE_PROVIDER, TRANSLATE_SERVICE_TIER } from './config'
import { LOCALE_NAMES } from '../i18n'
import { withRetry } from './retry'
import { progress } from './progress'

export interface TranslateModel {
  generate(input: { system: string; prompt: string }): Promise<string>
}

export function createOpenRouterModel(): TranslateModel {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    // OpenRouter app-attribution headers: HTTP-Referer (site URL) and X-Title
    // (app name) credit this traffic to LibreChat on openrouter.ai's app
    // rankings. https://openrouter.ai/docs/api-reference/overview#headers
    headers: {
      'HTTP-Referer': 'https://www.librechat.ai',
      'X-Title': 'LibreChat',
    },
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
    async generate({ system, prompt }) {
      const { text } = await withRetry(
        () => generateText({ model, system, prompt, temperature: 0.2, maxRetries: 0 }),
        {
          retries: maxRetries,
          // Backoff is routine on the flex tier: count it for the progress UI
          // instead of emitting a log line per attempt (that spam buried the
          // signal in CI). A retry that ultimately exhausts its budget still
          // surfaces — its error rides up to run.ts and into `skipped`.
          onRetry: () => progress.retry(),
        },
      )
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
  const raw = await opts.model.generate({ system, prompt })
  return stripWrappingFence(raw)
}
