import type { MetadataRoute } from "next";

import { getSiteUrl, SITE_LOCALES } from "./_lib/seo";

export default function robots(): MetadataRoute.Robots {
  const privateRoutes = ["account", "login", "register"];
  const localizedPrivateRoutes = SITE_LOCALES.flatMap((locale) =>
    privateRoutes.map((route) => `/${locale}/${route}`),
  );

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...privateRoutes.map((route) => `/${route}`),
        ...localizedPrivateRoutes,
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  };
}
