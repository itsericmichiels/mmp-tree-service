import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getCategories, addCategory } from "./blog-categories";

const fixturesRoot = path.join(os.tmpdir(), "mmp-blog-categories-test-fixtures");
const categoriesPath = path.join(fixturesRoot, "categories.json");

beforeEach(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
});

afterAll(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
});

describe("getCategories", () => {
  it("returns an empty array when the file doesn't exist yet", () => {
    expect(getCategories(categoriesPath)).toEqual([]);
  });

  it("returns the categories from the file", () => {
    fs.writeFileSync(categoriesPath, JSON.stringify(["Tree Care Tips", "Local Guides"]));
    expect(getCategories(categoriesPath)).toEqual(["Tree Care Tips", "Local Guides"]);
  });
});

describe("addCategory", () => {
  it("appends a new category and persists it", () => {
    const updated = addCategory("Storm Safety", categoriesPath);
    expect(updated).toEqual(["Storm Safety"]);
    expect(getCategories(categoriesPath)).toEqual(["Storm Safety"]);
  });

  it("does not add a case-insensitive duplicate", () => {
    addCategory("Storm Safety", categoriesPath);
    const updated = addCategory("storm safety", categoriesPath);
    expect(updated).toEqual(["Storm Safety"]);
  });

  it("ignores a blank or whitespace-only name", () => {
    expect(addCategory("   ", categoriesPath)).toEqual([]);
    expect(getCategories(categoriesPath)).toEqual([]);
  });

  it("trims whitespace before comparing and storing", () => {
    const updated = addCategory("  Company News  ", categoriesPath);
    expect(updated).toEqual(["Company News"]);
  });

  it("creates the containing directory if it doesn't exist yet", () => {
    const freshPath = path.join(fixturesRoot, "fresh", "categories.json");
    addCategory("Tree Care Tips", freshPath);
    expect(getCategories(freshPath)).toEqual(["Tree Care Tips"]);
  });
});
