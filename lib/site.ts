// lib/site.ts
export const SITE_URL = "https://www.mmptreeservice.com";

export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}
