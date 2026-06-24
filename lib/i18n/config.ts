/**
 * Script-side constants for the docs translation pipeline.
 * NOTE: this module uses build-time env and must not be imported by app/ components.
 */
export const DEFAULT_LOCALE = 'en'
export const TARGET_LOCALES = [
  'zh',
  'es',
  'fr',
  'de',
  'ja',
  'pt-BR',
  'it',
  'nl',
  'pl',
  'vi',
  'ko',
  'id',
  'tr',
] as const

/**
 * Bump to intentionally invalidate the whole translation memory (e.g. after a
 * prompt or model change). It is mixed into every block hash. Bumped to 2 with
 * the switch to gemini-3.1-flash-lite so cached gpt-nano output is re-translated.
 */
export const PROMPT_VERSION = '2'

/**
 * Model id used for translation. Validate CJK quality before changing the default.
 * `||` (not `??`) so an empty string — which CI sets when the optional
 * OPENROUTER_TRANSLATE_MODEL repo variable is unset — falls back to the default
 * instead of becoming an invalid empty model id.
 */
export const TRANSLATE_MODEL =
  process.env.OPENROUTER_TRANSLATE_MODEL || 'google/gemini-3.1-flash-lite'

/**
 * OpenRouter provider routing for translation: pin to Google AI Studio and use
 * its lower-cost `flex` service tier (high-volume, latency-tolerant batch work).
 */
export const TRANSLATE_PROVIDER = 'google-ai-studio'
export const TRANSLATE_SERVICE_TIER = 'flex'

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
