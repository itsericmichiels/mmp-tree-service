// lib/metaDescriptions.ts
// Purpose-built <meta name="description"> snippets for city hub and
// service+city pages, instead of truncating the (much longer) body intro
// copy — truncation was cutting mid-word past Google's ~155-char display
// limit. Checked against the longest (Avondale Estates, GA) and shortest
// (Canton, GA) built city names to stay within 120-155 chars either way.
export function buildHubDescription(cityName: string): string {
  return `Licensed, insured tree service in ${cityName} — removal, trimming & stump grinding by ISA-certified arborists. Free estimates: (470) 403-0215.`;
}

export function buildServiceCityDescription(serviceName: string, cityName: string): string {
  return `${serviceName} in ${cityName} from licensed, insured, ISA-certified arborists. Free estimates — call (470) 403-0215.`;
}
