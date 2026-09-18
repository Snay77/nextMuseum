import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const slugify = (string: string) => {
  return string
    .normalize("NFD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove diacritical marks
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // remove all non-word characters except hyphens
    .replace(/--+/g, "-") // replace multiple hyphens with a single hyphen
    .replace(/^-+/, "") // remove leading hyphens
    .replace(/-+$/, ""); // remove trailing hyphens
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch("https://api-museum.vercel.app/objects");
  const { objects } = await res.json();
  const paintings = objects.map((object: { title: string }) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/paintings/${slugify(object.title)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/paintings/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...paintings,
  ];
}