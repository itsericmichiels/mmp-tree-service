// lib/blog-categories.ts
import { supabase } from "./supabase";

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("blog_categories").select("name").order("name");
  if (error || !data) return [];
  return data.map((row) => row.name as string);
}

export async function addCategory(name: string): Promise<string[]> {
  const trimmed = name.trim();
  if (!trimmed) return getCategories();

  const existing = await getCategories();
  const exists = existing.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) return existing;

  await supabase.from("blog_categories").insert({ name: trimmed });
  return getCategories();
}
