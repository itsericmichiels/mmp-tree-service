// lib/seo.ts
// Next.js's metadata merging replaces the whole openGraph/twitter object at
// each page level rather than merging individual fields — so every page
// that sets its own openGraph/twitter must repeat the shared defaults
// (image, type, card) or it silently loses them. This helper is the single
// place those defaults live.
import type { Metadata } from "next";

export const DEFAULT_OG_IMAGE = "/images/crew-at-work.jpeg";

export function socialTags(title: string, description: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      siteName: "MMP Tree Service LLC",
      type: "website",
      locale: "en_US",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
