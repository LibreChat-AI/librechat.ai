/** Orama built-in stemmers keyed by this site's locale codes. */
export const SEARCH_LANGUAGE_BY_LOCALE: Record<string, string> = {
  en: 'english',
  es: 'spanish',
  fr: 'french',
  de: 'german',
  'pt-BR': 'portuguese',
  it: 'italian',
  nl: 'dutch',
  id: 'indonesian',
  tr: 'turkish',

  // Locales without Orama built-in splitters/stemmers use custom tokenizers.
}
