import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFakeSupabase } from "./test-utils/fakeSupabase";

const fakeSupabase = createFakeSupabase();
vi.mock("./supabase", () => ({ supabase: fakeSupabase, MEDIA_BUCKET: "media" }));

beforeEach(() => {
  for (const key of Object.keys(fakeSupabase.__tables)) delete fakeSupabase.__tables[key];
  for (const key of Object.keys(fakeSupabase.__files)) delete fakeSupabase.__files[key];
});

describe("isAllowedImage", () => {
  it("accepts jpg/jpeg/png/webp under the size cap", async () => {
    const { isAllowedImage } = await import("./media");
    expect(isAllowedImage("photo.jpg", 1024)).toBe(true);
    expect(isAllowedImage("photo.JPEG", 1024)).toBe(true);
    expect(isAllowedImage("photo.png", 1024)).toBe(true);
    expect(isAllowedImage("photo.webp", 1024)).toBe(true);
  });

  it("rejects disallowed extensions", async () => {
    const { isAllowedImage } = await import("./media");
    expect(isAllowedImage("script.svg", 1024)).toBe(false);
    expect(isAllowedImage("payload.exe", 1024)).toBe(false);
    expect(isAllowedImage("no-extension", 1024)).toBe(false);
  });

  it("rejects files over 10MB and zero-byte files", async () => {
    const { isAllowedImage } = await import("./media");
    expect(isAllowedImage("photo.jpg", 10 * 1024 * 1024 + 1)).toBe(false);
    expect(isAllowedImage("photo.jpg", 0)).toBe(false);
  });
});

describe("saveMediaFile", () => {
  it("uploads the file to storage and records metadata", async () => {
    const { saveMediaFile, getMediaById } = await import("./media");
    const item = await saveMediaFile(
      "Front Yard Oak.jpg",
      Buffer.from("fake-image-bytes"),
      "A large oak in a Canton front yard",
      ["canton"]
    );

    expect(item.alt).toBe("A large oak in a Canton front yard");
    expect(item.tags).toEqual(["canton"]);
    expect(item.filename).toMatch(/^front-yard-oak-[a-f0-9]{8}\.jpg$/);
    expect(fakeSupabase.__files[item.filename]).toBeDefined();
    expect(await getMediaById(item.id)).toEqual(item);
  });

  it("strips path-traversal characters from the original filename instead of writing outside the bucket", async () => {
    const { saveMediaFile } = await import("./media");
    const item = await saveMediaFile("../../../../etc/evil.png", Buffer.from("x"), "alt text", []);

    expect(item.filename).not.toContain("..");
    expect(item.filename).not.toContain("/");
    expect(fakeSupabase.__files[item.filename]).toBeDefined();
  });

  it("throws and writes nothing for a disallowed file type", async () => {
    const { saveMediaFile, getAllMedia } = await import("./media");
    await expect(saveMediaFile("payload.exe", Buffer.from("x"), "alt", [])).rejects.toThrow(
      /Rejected upload/
    );
    expect(await getAllMedia()).toEqual([]);
  });

  it("throws when alt text is blank", async () => {
    const { saveMediaFile } = await import("./media");
    await expect(saveMediaFile("photo.jpg", Buffer.from("x"), "   ", [])).rejects.toThrow(
      /Alt text is required/
    );
  });
});

describe("getAllMedia", () => {
  it("returns an empty array when nothing has been uploaded", async () => {
    const { getAllMedia } = await import("./media");
    expect(await getAllMedia()).toEqual([]);
  });

  it("returns items newest-uploaded first", async () => {
    const { saveMediaFile, getAllMedia } = await import("./media");
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const first = await saveMediaFile("a.jpg", Buffer.from("a"), "alt a", []);
      vi.setSystemTime(new Date("2026-01-01T00:00:01.000Z"));
      const second = await saveMediaFile("b.jpg", Buffer.from("b"), "alt b", []);
      const all = await getAllMedia();
      expect(all[0].id).toBe(second.id);
      expect(all[1].id).toBe(first.id);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("deleteMedia", () => {
  it("removes both the storage file and the metadata row, returning true", async () => {
    const { saveMediaFile, deleteMedia, getMediaById } = await import("./media");
    const item = await saveMediaFile("a.jpg", Buffer.from("a"), "alt", []);
    expect(fakeSupabase.__files[item.filename]).toBeDefined();

    const result = await deleteMedia(item.id);

    expect(result).toBe(true);
    expect(fakeSupabase.__files[item.filename]).toBeUndefined();
    expect(await getMediaById(item.id)).toBeNull();
  });

  it("returns false for an id that doesn't exist", async () => {
    const { deleteMedia } = await import("./media");
    expect(await deleteMedia("not-a-real-id")).toBe(false);
  });
});

describe("setMediaTags / toggleMediaTag", () => {
  it("setMediaTags replaces the tag list", async () => {
    const { saveMediaFile, setMediaTags } = await import("./media");
    const item = await saveMediaFile("a.jpg", Buffer.from("a"), "alt", ["x"]);
    const updated = await setMediaTags(item.id, ["our-work", "canton"]);
    expect(updated?.tags).toEqual(["our-work", "canton"]);
  });

  it("toggleMediaTag adds the tag when absent and removes it when present", async () => {
    const { saveMediaFile, toggleMediaTag } = await import("./media");
    const item = await saveMediaFile("a.jpg", Buffer.from("a"), "alt", []);
    const withTag = await toggleMediaTag(item.id, "our-work");
    expect(withTag?.tags).toEqual(["our-work"]);
    const withoutTag = await toggleMediaTag(item.id, "our-work");
    expect(withoutTag?.tags).toEqual([]);
  });

  it("returns null for an id that doesn't exist", async () => {
    const { setMediaTags, toggleMediaTag } = await import("./media");
    expect(await setMediaTags("nope", ["x"])).toBeNull();
    expect(await toggleMediaTag("nope", "x")).toBeNull();
  });
});
