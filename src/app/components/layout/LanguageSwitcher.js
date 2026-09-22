"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, SUPPORTED_LOCALES } from "../../i18n/config";
import { useI18n } from "../../i18n/I18nProvider";
import { replaceLocaleInPathname } from "../../i18n/routing";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (nextLocale) => {
    if (nextLocale === locale || isPending) return;

    // biome-ignore lint/suspicious/noDocumentCookie: le cookie doit être écrit avant la navigation localisée.
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = nextLocale;
    const nextPathname = replaceLocaleInPathname(pathname, nextLocale);
    const suffix = `${window.location.search}${window.location.hash}`;
    startTransition(() =>
      router.replace(`${nextPathname}${suffix}`, { scroll: false }),
    );
  };

  return (
    <fieldset
      className="m-0 flex items-center gap-1 border-0 p-0 font-mono text-[0.65rem] font-bold uppercase"
      aria-label={t("common.language")}
    >
      {SUPPORTED_LOCALES.map((item, index) => (
        <span key={item} className="flex items-center gap-1">
          {index > 0 ? <span className="text-ink/25">/</span> : null}
          <button
            type="button"
            lang={item}
            aria-pressed={locale === item}
            disabled={isPending}
            onClick={() => switchLocale(item)}
            className={`cursor-pointer transition-colors hover:text-blue disabled:cursor-wait ${
              locale === item ? "text-blue" : "text-ink/45"
            }`}
          >
            {item}
          </button>
        </span>
      ))}
    </fieldset>
  );
}
