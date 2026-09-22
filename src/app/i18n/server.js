import "server-only";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { isSupportedLocale } from "./config";
import { translate } from "./translate";

const dictionaries = {
  fr: () => import("./dictionaries/fr").then((module) => module.default),
  en: () => import("./dictionaries/en").then((module) => module.default),
};

export async function getLocale() {
  const locale = await rootLocale();
  if (!isSupportedLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(locale) {
  if (!isSupportedLocale(locale)) notFound();
  return dictionaries[locale]();
}

export async function getI18n() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return {
    locale,
    dictionary,
    t: (key, values) => translate(dictionary, key, values),
  };
}
