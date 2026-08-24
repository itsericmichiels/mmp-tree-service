// app/sitemap.ts
import type { MetadataRoute } from "next";
import { builtSlugs } from "@/lib/slugs";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

// Placeholder base URL — update once the site has a real production
// domain (this project is intended to eventually replace mmptreeservice.com).
const BASE_URL = "https://mmptreeservice.com";

const STATIC_PATHS = [
  "/",
  "/service-areas",
  "/about",
  "/testimonials",
  "/contact",
  "/our-work",
  "/blog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPaths = getAllPosts().map((post) => `/blog/${post.slug}`);
  const paths = [...STATIC_PATHS, ...builtSlugs().map((slug) => `/${slug}`), ...blogPaths];

  return paths.map((path) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
  }));
}
