// lib/site.ts
// Placeholder base URL — update once the site has a real production
// domain (this project is intended to eventually replace mmptreeservice.com).
export const SITE_URL = "https://mmptreeservice.com";

export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}
