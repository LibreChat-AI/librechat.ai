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
  languages: [
    'en',
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
  ],
  hideLocale: 'default-locale',
}

/**
 * Every implemented locale gets the same route surface: home page, language
 * switcher, browser-language detection, hreflang alternates, and docs links.
 */
export const LOCALIZED_HOME_LOCALES = i18n.languages as readonly string[]

export function hasLocalizedHome(lang?: string): boolean {
  return !!lang && LOCALIZED_HOME_LOCALES.includes(lang)
}

/**
 * Prefix an internal `/docs` path with the active locale so links from
 * localized surfaces (landing page CTAs, navbar, footer) keep the reader in
 * their language instead of dropping them onto the prefix-less English docs.
 *
 * Only `/docs` paths are localized; the docs route redirects a localized URL to
 * its English source when no translation exists, so a localized href is always
 * safe. The default language, external links, and non-docs internal paths
 * (`/blog`, `/changelog`, …) — which have no locale routes — are returned as-is.
 */
export function localizedDocsHref(href: string, lang?: string): string {
  if (!lang || lang === i18n.defaultLanguage) return href
  if (href !== '/docs' && !href.startsWith('/docs/')) return href
  return `/${lang}${href}`
}

/**
 * The landing-page URL for a locale. The default language lives at `/` (no
 * prefix, matching `hideLocale: 'default-locale'`); every other implemented
 * locale lives at `/<locale>`.
 */
export function localizedHomeHref(lang?: string): string {
  if (!lang || lang === i18n.defaultLanguage || !hasLocalizedHome(lang)) return '/'
  return `/${lang}`
}

export function localizedHomeAlternates(): Record<string, string> {
  return Object.fromEntries(
    LOCALIZED_HOME_LOCALES.map((locale) => [locale, localizedHomeHref(locale)]),
  )
}

/** Cookie that records an explicit language choice (read by the proxy's auto-detect). */
export const LOCALE_COOKIE = 'NEXT_LOCALE'

/**
 * Remember an explicit language choice in a cookie so the browser-language
 * auto-detection on `/` doesn't override the reader the next time they land on
 * the home page. Client-only; a no-op when called during SSR.
 */
export function rememberLocale(locale: string): void {
  if (typeof document === 'undefined') return
  // 1 year, lax: a first-party preference that should survive top-level navigations.
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
}

/** Human-readable names shown in the language switcher. */
export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  zh: '简体中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  'pt-BR': 'Português (Brasil)',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  vi: 'Tiếng Việt',
  ko: '한국어',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
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
  'pt-BR': {
    notice: 'Esta página foi traduzida por máquina e pode conter erros.',
    original: 'Ver o original em inglês',
    improve: 'Melhorar esta tradução',
  },
  it: {
    notice: 'Questa pagina è stata tradotta automaticamente e potrebbe contenere errori.',
    original: "Vedi l'originale in inglese",
    improve: 'Migliora questa traduzione',
  },
  nl: {
    notice: 'Deze pagina is machinaal vertaald en kan fouten bevatten.',
    original: 'Engels origineel bekijken',
    improve: 'Deze vertaling verbeteren',
  },
  pl: {
    notice: 'Ta strona została przetłumaczona maszynowo i może zawierać błędy.',
    original: 'Zobacz oryginał po angielsku',
    improve: 'Popraw to tłumaczenie',
  },
  vi: {
    notice: 'Trang này được dịch bằng máy và có thể có lỗi.',
    original: 'Xem bản gốc tiếng Anh',
    improve: 'Cải thiện bản dịch này',
  },
  ko: {
    notice: '이 페이지는 기계 번역되었으며 오류가 포함될 수 있습니다.',
    original: '영어 원문 보기',
    improve: '이 번역 개선하기',
  },
  id: {
    notice: 'Halaman ini diterjemahkan mesin dan mungkin berisi kesalahan.',
    original: 'Lihat versi asli bahasa Inggris',
    improve: 'Perbaiki terjemahan ini',
  },
  tr: {
    notice: 'Bu sayfa makine çevirisiyle çevrilmiştir ve hatalar içerebilir.',
    original: 'İngilizce aslına bak',
    improve: 'Bu çeviriyi iyileştir',
  },
}
