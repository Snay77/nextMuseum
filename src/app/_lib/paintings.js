const BASE_URL = "https://api-museum.vercel.app";

export const WIKIMEDIA_THUMBNAIL_WIDTHS = [
  120, 250, 330, 500, 960, 1280, 1920, 3840,
];

const THUMBNAIL_URL =
  /^(https:\/\/upload\.wikimedia\.org\/.+\/thumb\/.+)\/\d+px-([^/]+)$/;

export function isWikimediaThumbnail(src) {
  return THUMBNAIL_URL.test(src);
}

export function getWikimediaThumbnail(src, width) {
  const standardWidth =
    WIKIMEDIA_THUMBNAIL_WIDTHS.find((candidate) => candidate >= width) ??
    WIKIMEDIA_THUMBNAIL_WIDTHS[WIKIMEDIA_THUMBNAIL_WIDTHS.length - 1];

  return src.replace(THUMBNAIL_URL, `$1/${standardWidth}px-$2`);
}

export function getSimilarPaintings(currentPainting, paintings) {
  if (!currentPainting || !Array.isArray(paintings)) return [];

  const currentSlug = normalizeText(currentPainting.slug);
  const currentId = normalizeIdentifier(currentPainting.id);
  const currentYear = normalizeYear(currentPainting.year);

  const rankedPaintings = paintings
    .map((painting, index) => ({
      painting,
      index,
      score: getSimilarityScore(painting, currentPainting, currentYear),
    }))
    .filter(({ painting }) => {
      const hasImage =
        typeof painting?.image === "string"
          ? Boolean(painting.image.trim())
          : Boolean(painting?.image);

      if (!painting || !normalizeText(painting.slug) || !hasImage) {
        return false;
      }

      const isSameSlug =
        currentSlug && normalizeText(painting.slug) === currentSlug;
      const isSameId =
        currentId && normalizeIdentifier(painting.id) === currentId;

      return painting !== currentPainting && !isSameSlug && !isSameId;
    })
    .sort((first, second) => {
      return second.score - first.score || first.index - second.index;
    });

  const similarPaintings = rankedPaintings.filter(({ score }) => score > 0);
  const fallbackPaintings = rankedPaintings.filter(({ score }) => score === 0);

  return [...similarPaintings, ...fallbackPaintings]
    .slice(0, 3)
    .map(({ painting }) => painting);
}

function getSimilarityScore(painting, currentPainting, currentYear) {
  if (!painting) return 0;

  let score = 0;

  if (haveSameText(painting.movement, currentPainting.movement)) score += 5;
  if (haveSameText(painting.artist, currentPainting.artist)) score += 4;
  if (haveSameText(painting.type, currentPainting.type)) score += 3;

  const paintingYear = normalizeYear(painting.year);
  if (
    currentYear !== null &&
    paintingYear !== null &&
    Math.abs(currentYear - paintingYear) <= 20
  ) {
    score += 2;
  }

  if (haveSameText(painting.color, currentPainting.color)) score += 1;

  return score;
}

function haveSameText(firstValue, secondValue) {
  const first = normalizeText(firstValue);
  const second = normalizeText(secondValue);

  return Boolean(first && second && first === second);
}

function normalizeText(value) {
  if (typeof value !== "string") return "";

  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeIdentifier(value) {
  if (value === null || value === undefined) return "";

  return String(value).trim();
}

function normalizeYear(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : null;
  }

  if (typeof value !== "string") return null;

  const match = value.trim().match(/(?:^|\D)(-?\d{3,4})(?:\D|$)/);
  if (!match) return null;

  const year = Number(match[1]);
  return Number.isFinite(year) ? year : null;
}

export async function getObjects() {
  const res = await fetch(`${BASE_URL}/objects`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Unable to load paintings: ${res.status}`);
  }

  const payload = await res.json();

  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of ["objects", "data", "results"]) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  throw new Error("The paintings API response does not contain an array");
}

export async function getObject(slug) {
  const res = await fetch(`${BASE_URL}/objects/${slug}`, {
    method: "GET",
  });

  if (res.status === 404) return null;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(payload?.error ?? `Unable to load painting: ${res.status}`);
  }

  return payload;
}
