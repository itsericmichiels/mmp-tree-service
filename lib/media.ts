// lib/media.ts
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type MediaItem = {
  id: string;
  filename: string;
  url: string;
  alt: string;
  tags: string[];
  uploadedAt: string;
};

export const MEDIA_METADATA_PATH = path.join(process.cwd(), "content/media/media.json");
export const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function readMetadata(metadataPath: string): MediaItem[] {
  if (!fs.existsSync(metadataPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMetadata(metadataPath: string, items: MediaItem[]): void {
  const dir = path.dirname(metadataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(metadataPath, JSON.stringify(items, null, 2), "utf-8");
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

export function getAllMedia(metadataPath: string = MEDIA_METADATA_PATH): MediaItem[] {
  return readMetadata(metadataPath).sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export function getMediaById(
  id: string,
  metadataPath: string = MEDIA_METADATA_PATH
): MediaItem | null {
  return readMetadata(metadataPath).find((item) => item.id === id) ?? null;
}

export function saveMediaFile(
  originalFilename: string,
  buffer: Buffer,
  alt: string,
  tags: string[] = [],
  metadataPath: string = MEDIA_METADATA_PATH,
  uploadsDir: string = UPLOADS_DIR
): MediaItem {
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

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  const item: MediaItem = {
    id,
    filename,
    url: `/uploads/${filename}`,
    alt: alt.trim(),
    tags: tags.map((t) => t.trim()).filter(Boolean),
    uploadedAt: new Date().toISOString(),
  };

  const items = readMetadata(metadataPath);
  items.push(item);
  writeMetadata(metadataPath, items);

  return item;
}

export function deleteMedia(
  id: string,
  metadataPath: string = MEDIA_METADATA_PATH,
  uploadsDir: string = UPLOADS_DIR
): boolean {
  const items = readMetadata(metadataPath);
  const item = items.find((i) => i.id === id);
  if (!item) return false;

  const filePath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  writeMetadata(metadataPath, items.filter((i) => i.id !== id));
  return true;
}

export function setMediaTags(
  id: string,
  tags: string[],
  metadataPath: string = MEDIA_METADATA_PATH
): MediaItem | null {
  const items = readMetadata(metadataPath);
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.tags = tags.map((t) => t.trim()).filter(Boolean);
  writeMetadata(metadataPath, items);
  return item;
}

export function toggleMediaTag(
  id: string,
  tag: string,
  metadataPath: string = MEDIA_METADATA_PATH
): MediaItem | null {
  const items = readMetadata(metadataPath);
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  item.tags = item.tags.includes(tag)
    ? item.tags.filter((t) => t !== tag)
    : [...item.tags, tag];
  writeMetadata(metadataPath, items);
  return item;
}
