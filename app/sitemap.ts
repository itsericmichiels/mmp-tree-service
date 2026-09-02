// app/sitemap.ts
import type { MetadataRoute } from "next";
import { builtSlugs } from "@/lib/slugs";
import { getAllPosts } from "@/lib/blog";
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
  const posts = await getAllPosts();
  const blogPaths = posts.map((post) => `/blog/${post.slug}`);
  const paths = [...STATIC_PATHS, ...builtSlugs().map((slug) => `/${slug}`), ...blogPaths];

  return paths.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));
}
