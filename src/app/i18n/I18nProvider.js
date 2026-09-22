"use client";

import { createContext, useContext, useMemo } from "react";
import { translate } from "./translate";

const I18nContext = createContext(null);

export default function I18nProvider({ locale, dictionary, children }) {
  const value = useMemo(
    () => ({
      locale,
      dictionary,
      t: (key, values) => translate(dictionary, key, values),
    }),
    [dictionary, locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
