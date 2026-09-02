import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "./test-utils/fakeSupabase";

const fakeSupabase = createFakeSupabase();
vi.mock("./supabase", () => ({ supabase: fakeSupabase, MEDIA_BUCKET: "media" }));

beforeEach(() => {
  for (const key of Object.keys(fakeSupabase.__tables)) delete fakeSupabase.__tables[key];
  for (const key of Object.keys(fakeSupabase.__files)) delete fakeSupabase.__files[key];
});

describe("getHeroImageUrl", () => {
  it("returns null when the slug has no assignment yet", async () => {
    const { getHeroImageUrl } = await import("./hero-images");
    expect(await getHeroImageUrl("tree-service-canton-ga")).toBeNull();
  });

  it("returns null when a different slug has an assignment", async () => {
    const { getHeroImageUrl, assignHero } = await import("./hero-images");
    await assignHero("tree-service-marietta-ga", "some-id");
    expect(await getHeroImageUrl("tree-service-canton-ga")).toBeNull();
  });

  it("returns the assigned media's URL", async () => {
    const { saveMediaFile } = await import("./media");
    const { getHeroImageUrl, assignHero } = await import("./hero-images");
    const item = await saveMediaFile("canton-oak.jpg", Buffer.from("x"), "A big oak in Canton", []);
    await assignHero("tree-service-canton-ga", item.id);

    expect(await getHeroImageUrl("tree-service-canton-ga")).toBe(item.url);
  });

  it("returns null if the assigned media id no longer exists", async () => {
    const { getHeroImageUrl, assignHero } = await import("./hero-images");
    await assignHero("tree-service-canton-ga", "deleted-media-id");
    expect(await getHeroImageUrl("tree-service-canton-ga")).toBeNull();
  });
});

describe("assignHero / clearHero", () => {
  it("assignHero overwrites a previous assignment for the same slug", async () => {
    const { saveMediaFile } = await import("./media");
    const { getHeroImageUrl, assignHero } = await import("./hero-images");
    const first = await saveMediaFile("a.jpg", Buffer.from("a"), "alt a", []);
    const second = await saveMediaFile("b.jpg", Buffer.from("b"), "alt b", []);

    await assignHero("tree-service-canton-ga", first.id);
    await assignHero("tree-service-canton-ga", second.id);

    expect(await getHeroImageUrl("tree-service-canton-ga")).toBe(second.url);
  });

  it("clearHero removes the assignment", async () => {
    const { saveMediaFile } = await import("./media");
    const { getHeroImageUrl, assignHero, clearHero } = await import("./hero-images");
    const item = await saveMediaFile("a.jpg", Buffer.from("a"), "alt", []);
    await assignHero("tree-service-canton-ga", item.id);
    await clearHero("tree-service-canton-ga");
    expect(await getHeroImageUrl("tree-service-canton-ga")).toBeNull();
  });

  it("clearHero on a slug with no assignment is a no-op, not an error", async () => {
    const { clearHero } = await import("./hero-images");
    await expect(clearHero("never-assigned-slug")).resolves.not.toThrow();
  });
});

describe("getAllHeroAssignments", () => {
  it("returns an empty object when nothing is assigned yet", async () => {
    const { getAllHeroAssignments } = await import("./hero-images");
    expect(await getAllHeroAssignments()).toEqual({});
  });

  it("returns every slug->mediaId assignment", async () => {
    const { assignHero, getAllHeroAssignments } = await import("./hero-images");
    await assignHero("tree-service-canton-ga", "id-1");
    await assignHero("tree-removal-marietta-ga", "id-2");
    expect(await getAllHeroAssignments()).toEqual({
      "tree-service-canton-ga": "id-1",
      "tree-removal-marietta-ga": "id-2",
    });
  });
});
