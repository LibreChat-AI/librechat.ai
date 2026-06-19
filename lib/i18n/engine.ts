import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { GLOSSARY, TRANSLATE_MODEL } from './config'
import { LOCALE_NAMES } from '../i18n'

export interface TranslateModel {
  generate(input: { system: string; prompt: string }): Promise<string>
}

export function createOpenRouterModel(): TranslateModel {
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
  const model = openrouter.chat(TRANSLATE_MODEL)
  return {
    async generate({ system, prompt }) {
      const { text } = await generateText({ model, system, prompt, temperature: 0.2 })
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
  return match ? match[1] : s
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
