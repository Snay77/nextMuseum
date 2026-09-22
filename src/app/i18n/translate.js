export function getTranslation(dictionary, key) {
  return key
    .split(".")
    .reduce((value, segment) => value?.[segment], dictionary);
}

export function translate(dictionary, key, values = {}) {
  const translation = getTranslation(dictionary, key);

  if (typeof translation !== "string") return translation ?? key;

  return Object.entries(values).reduce(
    (value, [name, replacement]) =>
      value.replaceAll(`{${name}}`, String(replacement)),
    translation,
  );
}
