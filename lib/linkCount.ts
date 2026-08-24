export type LinkCounts = { internal: number; external: number };

export function countLinks(
  markdown: string,
  siteDomain: string = "mmptreeservice.com"
): LinkCounts {
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let internal = 0;
  let external = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = match[1];
    if (url.startsWith("/") || url.includes(siteDomain)) {
      internal++;
    } else {
      external++;
    }
  }
  return { internal, external };
}
