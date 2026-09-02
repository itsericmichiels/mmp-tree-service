// lib/media.ts
import crypto from "node:crypto";
import { supabase, MEDIA_BUCKET } from "./supabase";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  tags: string[];
  uploadedAt: string;
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type MediaRow = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  tags: string[];
  uploaded_at: string;
};

function fromRow(row: MediaRow): MediaItem {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    alt: row.alt,
    tags: row.tags ?? [],
    uploadedAt: row.uploaded_at,
  };
}

function extensionFor(originalFilename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(originalFilename);
  return match ? match[1].toLowerCase() : "";
}

function slugifyBase(originalFilename: string): string {
  const withoutExt = originalFilename.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "image";
}

export function isAllowedImage(originalFilename: string, sizeBytes: number): boolean {
  const ext = extensionFor(originalFilename);
  return ALLOWED_EXTENSIONS.has(ext) && sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_BYTES;
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("uploaded_at", { ascending: false });
  if (error || !data) return [];
  return data.map(fromRow);
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
  const { data, error } = await supabase.from("media").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return fromRow(data);
}

export async function saveMediaFile(
  originalFilename: string,
  buffer: Buffer,
  alt: string,
  tags: string[] = []
): Promise<MediaItem> {
  if (!isAllowedImage(originalFilename, buffer.byteLength)) {
    throw new Error(
      `Rejected upload "${originalFilename}": must be jpg/jpeg/png/webp and 10MB or smaller`
    );
  }
  if (!alt.trim()) {
    throw new Error("Alt text is required");
  }

  const ext = extensionFor(originalFilename);
  const base = slugifyBase(originalFilename);
  const id = crypto.randomUUID();
  const filename = `${base}-${id.slice(0, 8)}.${ext}`;

  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(filename, buffer, { contentType });
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filename);

  const item: MediaItem = {
    id,
    filename,
    url: publicUrlData.publicUrl,
    alt: alt.trim(),
    tags: tags.map((t) => t.trim()).filter(Boolean),
    uploadedAt: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("media").insert({
    id: item.id,
    filename: item.filename,
    url: item.url,
    alt: item.alt,
    tags: item.tags,
    uploaded_at: item.uploadedAt,
  });
  if (insertError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([filename]);
    throw new Error(`Failed to save media record: ${insertError.message}`);
  }

  return item;
}

export async function deleteMedia(id: string): Promise<boolean> {
  const item = await getMediaById(id);
  if (!item) return false;

  await supabase.storage.from(MEDIA_BUCKET).remove([item.filename]);
  await supabase.from("media").delete().eq("id", id);
  return true;
}

export async function setMediaTags(id: string, tags: string[]): Promise<MediaItem | null> {
  const cleanTags = tags.map((t) => t.trim()).filter(Boolean);
  const { data, error } = await supabase
    .from("media")
    .update({ tags: cleanTags })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return null;
  return fromRow(data);
}

export async function toggleMediaTag(id: string, tag: string): Promise<MediaItem | null> {
  const item = await getMediaById(id);
  if (!item) return null;
  const tags = item.tags.includes(tag) ? item.tags.filter((t) => t !== tag) : [...item.tags, tag];
  return setMediaTags(id, tags);
}
