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

/** Localized strings for the machine-translation notice banner. */
export const MT_BANNER: Record<string, { notice: string; original: string; improve: string }> = {
  zh: {
    notice: '本页面由机器翻译，可能包含错误。',
    original: '查看英文原文',
    improve: '改进此翻译',
  },
  es: {
    notice: 'Esta página fue traducida automáticamente y puede contener errores.',
    original: 'Ver el original en inglés',
    improve: 'Mejorar esta traducción',
  },
  fr: {
    notice: 'Cette page a été traduite automatiquement et peut contenir des erreurs.',
    original: "Voir l'original en anglais",
    improve: 'Améliorer cette traduction',
  },
  de: {
    notice: 'Diese Seite wurde maschinell übersetzt und kann Fehler enthalten.',
    original: 'Englisches Original ansehen',
    improve: 'Diese Übersetzung verbessern',
  },
  ja: {
    notice: 'このページは機械翻訳されており、誤りが含まれている可能性があります。',
    original: '英語の原文を表示',
    improve: 'この翻訳を改善する',
  },
}

