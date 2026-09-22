export const SUPPORTED_LOCALES = ["fr", "en"];
export const DEFAULT_LOCALE = "fr";
export const LOCALE_COOKIE = "new-museum-locale";

export function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}
