// app/sitemap.ts
import type { MetadataRoute } from "next";
import { builtSlugs } from "@/lib/slugs";
import { getPublishedPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "/",
  "/service-areas",
  "/about",
  "/testimonials",
  "/contact",
  "/our-work",
  "/blog",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const buildDate = new Date();
  const posts = await getPublishedPosts();

  const staticAndCityEntries = [...STATIC_PATHS, ...builtSlugs().map((slug) => `/${slug}`)].map(
    (path) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified: buildDate,
      changeFrequency: "monthly" as const,
    })
  );

  const blogEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
  }));

  return [...staticAndCityEntries, ...blogEntries];
}
