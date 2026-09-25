export const SITE_LOCALES = ["fr", "en"] as const;

const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  return (configuredUrl || LOCAL_SITE_URL).replace(/\/+$/, "");
}

export function getLocalizedUrl(
  locale: (typeof SITE_LOCALES)[number],
  path = "",
) {
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;

  return `${getSiteUrl()}/${locale}${normalizedPath}`;
}

export function getLanguageAlternates(path = "") {
  return Object.fromEntries(
    SITE_LOCALES.map((locale) => [locale, getLocalizedUrl(locale, path)]),
  );
}
