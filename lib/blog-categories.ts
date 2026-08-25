// lib/blog-categories.ts
import fs from "node:fs";
import path from "node:path";

export const CATEGORIES_PATH = path.join(process.cwd(), "content/blog/categories.json");

function readCategories(categoriesPath: string): string[] {
  if (!fs.existsSync(categoriesPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string") : [];
  } catch {
    return [];
  }
}

function writeCategories(categoriesPath: string, categories: string[]): void {
  const dir = path.dirname(categoriesPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), "utf-8");
}

export function getCategories(categoriesPath: string = CATEGORIES_PATH): string[] {
  return readCategories(categoriesPath);
}

export function addCategory(name: string, categoriesPath: string = CATEGORIES_PATH): string[] {
  const trimmed = name.trim();
  const categories = readCategories(categoriesPath);
  if (!trimmed) return categories;

  const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) return categories;

  const updated = [...categories, trimmed];
  writeCategories(categoriesPath, updated);
  return updated;
}
