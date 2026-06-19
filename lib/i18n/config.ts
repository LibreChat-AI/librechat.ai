/**
 * Script-side constants for the docs translation pipeline.
 * NOTE: this module uses build-time env and must not be imported by app/ components.
 */
export const DEFAULT_LOCALE = 'en'
export const TARGET_LOCALES = ['zh', 'es', 'fr', 'de', 'ja'] as const

/**
 * Bump to intentionally invalidate the whole translation memory (e.g. after a
 * prompt or model change). It is mixed into every block hash.
 */
export const PROMPT_VERSION = '1'

/** Model id used for translation. Validate CJK quality before changing the default. */
export const TRANSLATE_MODEL = process.env.OPENROUTER_TRANSLATE_MODEL ?? 'openai/gpt-5.4-nano'

/** Terms that must never be translated and must stay spelled exactly as written. */
export const GLOSSARY = [
  'LibreChat',
  'librechat.yaml',
  '.env',
  'Docker',
  'MCP',
  'OpenAI',
  'Anthropic',
  'Azure',
  'Bedrock',
  'OpenRouter',
  'endpoint',
  'Model Specs',
]
