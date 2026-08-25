// lib/media-actions.ts
"use server";

import { redirect } from "next/navigation";
import { saveMediaFile, deleteMedia, toggleMediaTag } from "@/lib/media";
import { assignHero, clearHero } from "@/lib/hero-images";

export async function uploadMediaAction(formData: FormData): Promise<void> {
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file uploaded");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  saveMediaFile(file.name, buffer, alt, tags);
  redirect("/admin/media");
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) deleteMedia(id);
  redirect("/admin/media");
}

export async function toggleOurWorkAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) toggleMediaTag(id, "our-work");
  redirect("/admin/media");
}

export async function assignHeroAction(formData: FormData): Promise<void> {
  const mediaId = String(formData.get("mediaId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (slug && mediaId) assignHero(slug, mediaId);
  redirect("/admin/media");
}

export async function clearHeroAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (slug) clearHero(slug);
  redirect("/admin/media");
}
