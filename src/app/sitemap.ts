import type { MetadataRoute } from "next";

import { getObjects } from "./_lib/paintings";
import {
  getLanguageAlternates,
  getLocalizedUrl,
  SITE_LOCALES,
} from "./_lib/seo";

export const dynamic = "force-dynamic";

const PUBLIC_ROUTES = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/paintings", changeFrequency: "weekly", priority: 0.9 },
  { path: "/agenda", changeFrequency: "weekly", priority: 0.8 },
  { path: "/billetterie", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
] as const;

function createLocalizedEntries(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap {
  const languages = getLanguageAlternates(path);

  return SITE_LOCALES.map((locale) => ({
    url: getLocalizedUrl(locale, path),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const objects = await getObjects().catch(() => []);
  const slugs = [
    ...new Set(
      objects
        .map((object) => object?.slug)
        .filter((slug): slug is string =>
          Boolean(typeof slug === "string" && slug.trim()),
        ),
    ),
  ];

  const publicEntries = PUBLIC_ROUTES.flatMap((route) =>
    createLocalizedEntries(route.path, route.changeFrequency, route.priority),
  );
  const paintingEntries = slugs.flatMap((slug) =>
    createLocalizedEntries(`/paintings/${slug}`, "monthly", 0.7),
  );

  return [...publicEntries, ...paintingEntries];
}
