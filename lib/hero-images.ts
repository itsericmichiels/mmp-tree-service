// lib/hero-images.ts
import { supabase } from "./supabase";
import { getMediaById } from "./media";

export async function getHeroImageUrl(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("hero_assignments")
    .select("media_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  const media = await getMediaById(data.media_id);
  return media ? media.url : null;
}

export async function assignHero(slug: string, mediaId: string): Promise<void> {
  await supabase.from("hero_assignments").upsert({ slug, media_id: mediaId });
}

export async function clearHero(slug: string): Promise<void> {
  await supabase.from("hero_assignments").delete().eq("slug", slug);
}

export async function getAllHeroAssignments(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("hero_assignments").select("slug, media_id");
  if (error || !data) return {};
  return Object.fromEntries(data.map((row) => [row.slug, row.media_id]));
}
