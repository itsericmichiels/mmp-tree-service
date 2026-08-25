import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getAllMedia,
  getMediaById,
  isAllowedImage,
  saveMediaFile,
  deleteMedia,
  setMediaTags,
  toggleMediaTag,
} from "./media";

const fixturesRoot = path.join(os.tmpdir(), "mmp-media-test-fixtures");
const metadataPath = path.join(fixturesRoot, "media.json");
const uploadsDir = path.join(fixturesRoot, "uploads");

beforeEach(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
});

afterAll(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
});

describe("isAllowedImage", () => {
  it("accepts jpg/jpeg/png/webp under the size cap", () => {
    expect(isAllowedImage("photo.jpg", 1024)).toBe(true);
    expect(isAllowedImage("photo.JPEG", 1024)).toBe(true);
    expect(isAllowedImage("photo.png", 1024)).toBe(true);
    expect(isAllowedImage("photo.webp", 1024)).toBe(true);
  });

  it("rejects disallowed extensions", () => {
    expect(isAllowedImage("script.svg", 1024)).toBe(false);
    expect(isAllowedImage("payload.exe", 1024)).toBe(false);
    expect(isAllowedImage("no-extension", 1024)).toBe(false);
  });

  it("rejects files over 10MB and zero-byte files", () => {
    expect(isAllowedImage("photo.jpg", 10 * 1024 * 1024 + 1)).toBe(false);
    expect(isAllowedImage("photo.jpg", 0)).toBe(false);
  });
});

describe("saveMediaFile", () => {
  it("writes the file to uploadsDir and records metadata", () => {
    const item = saveMediaFile(
      "Front Yard Oak.jpg",
      Buffer.from("fake-image-bytes"),
      "A large oak in a Canton front yard",
      ["canton"],
      metadataPath,
      uploadsDir
    );

    expect(item.alt).toBe("A large oak in a Canton front yard");
    expect(item.tags).toEqual(["canton"]);
    expect(item.filename).toMatch(/^front-yard-oak-[a-f0-9]{8}\.jpg$/);
    expect(item.url).toBe(`/uploads/${item.filename}`);
    expect(fs.existsSync(path.join(uploadsDir, item.filename))).toBe(true);
    expect(getMediaById(item.id, metadataPath)).toEqual(item);
  });

  it("strips path-traversal characters from the original filename instead of writing outside uploadsDir", () => {
    const item = saveMediaFile(
      "../../../../etc/evil.png",
      Buffer.from("x"),
      "alt text",
      [],
      metadataPath,
      uploadsDir
    );

    expect(item.filename).not.toContain("..");
    expect(item.filename).not.toContain("/");
    expect(fs.existsSync(path.join(uploadsDir, item.filename))).toBe(true);
    expect(fs.existsSync("/etc/evil.png")).toBe(false);
  });

  it("throws and writes nothing for a disallowed file type", () => {
    expect(() =>
      saveMediaFile("payload.exe", Buffer.from("x"), "alt", [], metadataPath, uploadsDir)
    ).toThrow(/Rejected upload/);
    expect(getAllMedia(metadataPath)).toEqual([]);
  });

  it("throws when alt text is blank", () => {
    expect(() =>
      saveMediaFile("photo.jpg", Buffer.from("x"), "   ", [], metadataPath, uploadsDir)
    ).toThrow(/Alt text is required/);
  });

  it("creates uploadsDir and the metadata directory if they don't exist yet", () => {
    const freshMetadata = path.join(fixturesRoot, "fresh", "media.json");
    const freshUploads = path.join(fixturesRoot, "fresh-uploads");
    const item = saveMediaFile(
      "photo.png",
      Buffer.from("x"),
      "alt",
      [],
      freshMetadata,
      freshUploads
    );
    expect(fs.existsSync(path.join(freshUploads, item.filename))).toBe(true);
    expect(getAllMedia(freshMetadata)).toHaveLength(1);
  });
});

describe("getAllMedia", () => {
  it("returns an empty array when the metadata file doesn't exist", () => {
    expect(getAllMedia(metadataPath)).toEqual([]);
  });

  it("returns items newest-uploaded first", () => {
    const first = saveMediaFile("a.jpg", Buffer.from("a"), "alt a", [], metadataPath, uploadsDir);
    const second = saveMediaFile("b.jpg", Buffer.from("b"), "alt b", [], metadataPath, uploadsDir);
    const all = getAllMedia(metadataPath);
    expect(all[0].id).toBe(second.id);
    expect(all[1].id).toBe(first.id);
  });
});

describe("deleteMedia", () => {
  it("removes both the file and the metadata entry, returning true", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", [], metadataPath, uploadsDir);
    const filePath = path.join(uploadsDir, item.filename);
    expect(fs.existsSync(filePath)).toBe(true);

    const result = deleteMedia(item.id, metadataPath, uploadsDir);

    expect(result).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
    expect(getMediaById(item.id, metadataPath)).toBeNull();
  });

  it("returns false for an id that doesn't exist", () => {
    expect(deleteMedia("not-a-real-id", metadataPath, uploadsDir)).toBe(false);
  });
});

describe("setMediaTags / toggleMediaTag", () => {
  it("setMediaTags replaces the tag list", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", ["x"], metadataPath, uploadsDir);
    const updated = setMediaTags(item.id, ["our-work", "canton"], metadataPath);
    expect(updated?.tags).toEqual(["our-work", "canton"]);
  });

  it("toggleMediaTag adds the tag when absent and removes it when present", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", [], metadataPath, uploadsDir);
    const withTag = toggleMediaTag(item.id, "our-work", metadataPath);
    expect(withTag?.tags).toEqual(["our-work"]);
    const withoutTag = toggleMediaTag(item.id, "our-work", metadataPath);
    expect(withoutTag?.tags).toEqual([]);
  });

  it("returns null for an id that doesn't exist", () => {
    expect(setMediaTags("nope", ["x"], metadataPath)).toBeNull();
    expect(toggleMediaTag("nope", "x", metadataPath)).toBeNull();
  });
});
