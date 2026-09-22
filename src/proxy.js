import { NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE,
} from "./app/i18n/config";
import { getLocaleFromPathname } from "./app/i18n/routing";

function getPreferredLocale(request) {
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isSupportedLocale(savedLocale)) return savedLocale;

  const acceptedLanguages = request.headers
    .get("accept-language")
    ?.toLowerCase()
    .split(",")
    .map((language) => language.trim().split(";")[0].split("-")[0]);

  return (
    acceptedLanguages?.find((language) => isSupportedLocale(language)) ??
    DEFAULT_LOCALE
  );
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const pathnameLocale = getLocaleFromPathname(pathname);

  if (pathnameLocale) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, pathnameLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
