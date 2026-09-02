import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "./test-utils/fakeSupabase";

const fakeSupabase = createFakeSupabase();
vi.mock("./supabase", () => ({ supabase: fakeSupabase }));

beforeEach(() => {
  for (const key of Object.keys(fakeSupabase.__tables)) delete fakeSupabase.__tables[key];
});

describe("getCategories", () => {
  it("returns an empty array when no categories exist yet", async () => {
    const { getCategories } = await import("./blog-categories");
    expect(await getCategories()).toEqual([]);
  });

  it("returns the stored categories, alphabetically", async () => {
    const { getCategories, addCategory } = await import("./blog-categories");
    await addCategory("Tree Care Tips");
    await addCategory("Local Guides");
    expect(await getCategories()).toEqual(["Local Guides", "Tree Care Tips"]);
  });
});

describe("addCategory", () => {
  it("adds a new category and persists it", async () => {
    const { getCategories, addCategory } = await import("./blog-categories");
    const updated = await addCategory("Storm Safety");
    expect(updated).toEqual(["Storm Safety"]);
    expect(await getCategories()).toEqual(["Storm Safety"]);
  });

  it("does not add a case-insensitive duplicate", async () => {
    const { addCategory } = await import("./blog-categories");
    await addCategory("Storm Safety");
    const updated = await addCategory("storm safety");
    expect(updated).toEqual(["Storm Safety"]);
  });

  it("ignores a blank or whitespace-only name", async () => {
    const { getCategories, addCategory } = await import("./blog-categories");
    expect(await addCategory("   ")).toEqual([]);
    expect(await getCategories()).toEqual([]);
  });

  it("trims whitespace before comparing and storing", async () => {
    const { addCategory } = await import("./blog-categories");
    const updated = await addCategory("  Company News  ");
    expect(updated).toEqual(["Company News"]);
  });
});
