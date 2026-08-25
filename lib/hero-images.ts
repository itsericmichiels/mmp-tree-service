// lib/hero-images.ts
import fs from "node:fs";
import path from "node:path";
import { MEDIA_METADATA_PATH, getMediaById } from "./media";

export const HERO_ASSIGNMENTS_PATH = path.join(
  process.cwd(),
  "content/media/hero-assignments.json"
);

type HeroAssignments = Record<string, string>;

function readAssignments(assignmentsPath: string): HeroAssignments {
  if (!fs.existsSync(assignmentsPath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(assignmentsPath, "utf-8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeAssignments(assignmentsPath: string, assignments: HeroAssignments): void {
  const dir = path.dirname(assignmentsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(assignmentsPath, JSON.stringify(assignments, null, 2), "utf-8");
}

export function getHeroImageUrl(
  slug: string,
  assignmentsPath: string = HERO_ASSIGNMENTS_PATH,
  metadataPath: string = MEDIA_METADATA_PATH
): string | null {
  const mediaId = readAssignments(assignmentsPath)[slug];
  if (!mediaId) return null;
  const media = getMediaById(mediaId, metadataPath);
  return media ? media.url : null;
}

export function assignHero(
  slug: string,
  mediaId: string,
  assignmentsPath: string = HERO_ASSIGNMENTS_PATH
): void {
  const assignments = readAssignments(assignmentsPath);
  assignments[slug] = mediaId;
  writeAssignments(assignmentsPath, assignments);
}

export function clearHero(slug: string, assignmentsPath: string = HERO_ASSIGNMENTS_PATH): void {
  const assignments = readAssignments(assignmentsPath);
  delete assignments[slug];
  writeAssignments(assignmentsPath, assignments);
}

export function getAllHeroAssignments(
  assignmentsPath: string = HERO_ASSIGNMENTS_PATH
): HeroAssignments {
  return readAssignments(assignmentsPath);
}
