/**
 * OpenRouter uses HTTP-Referer as the app's unique identifier. Keep this URL
 * aligned with the established LibreChat listing at openrouter.ai/apps/librechat:
 * using the www hostname creates a separate app instead of crediting LibreChat.
 *
 * X-OpenRouter-Title is the current header name; OpenRouter retains X-Title only
 * for backwards compatibility.
 * https://openrouter.ai/docs/app-attribution
 */
export const OPENROUTER_APP_HEADERS = {
  'HTTP-Referer': 'https://librechat.ai/',
  'X-OpenRouter-Title': 'LibreChat',
} as const
