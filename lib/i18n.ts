import type { I18nConfig } from 'fumadocs-core/i18n'

/**
 * Internationalization config for the docs.
 *
 * This is the single source of truth for which locales the site builds. To add
 * a language, append its code here and add a display name in LOCALE_NAMES; the
 * automated translation workflow then drops `*.<locale>.mdx` files next to the
 * English source in content/docs and Fumadocs serves them automatically.
 *
 * `hideLocale: 'default-locale'` keeps English at its existing URLs (/docs/...)
 * with no prefix; other locales are served under /<locale>/docs/...
 */
export const i18n: I18nConfig = {
  defaultLanguage: 'en',
  languages: ['en', 'zh', 'es', 'fr', 'de', 'ja'],
  hideLocale: 'default-locale',
}

/** Human-readable names shown in the language switcher. */
export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  zh: '简体中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
}
