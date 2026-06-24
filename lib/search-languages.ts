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

  // Orama 3 has no built-in stemmers for these locales, so use the default
  // tokenizer instead of passing unsupported language codes at build time.
  pl: 'english',
  vi: 'english',
  ko: 'english',
}
