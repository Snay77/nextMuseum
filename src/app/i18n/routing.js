import { DEFAULT_LOCALE, isSupportedLocale } from "./config";

export function getLocaleFromPathname(pathname = "") {
  const candidate = pathname.split("/")[1];
  return isSupportedLocale(candidate) ? candidate : null;
}

export function stripLocaleFromPathname(pathname = "/") {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname || "/";

  const pathnameWithoutLocale = pathname.slice(locale.length + 1);
  return pathnameWithoutLocale || "/";
}

export function localizePathname(pathname = "/", locale = DEFAULT_LOCALE) {
  const safeLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const pathnameWithoutLocale = stripLocaleFromPathname(pathname);

  return pathnameWithoutLocale === "/"
    ? `/${safeLocale}`
    : `/${safeLocale}${pathnameWithoutLocale}`;
}

export function localizeHref(href, locale = DEFAULT_LOCALE) {
  if (
    typeof href !== "string" ||
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.startsWith("/api/")
  ) {
    return href;
  }

  const url = new URL(href, "https://new-museum.local");
  url.pathname = localizePathname(url.pathname, locale);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function replaceLocaleInPathname(pathname, locale) {
  return localizePathname(pathname, locale);
}
