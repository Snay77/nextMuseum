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

    const payload = await res.json();

    if (!res.ok) {
        throw new Error(payload?.error ?? `Unable to load painting: ${res.status}`);
    }

    return payload;
}