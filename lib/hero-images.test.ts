import { describe, it, expect, beforeEach, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { saveMediaFile } from "./media";
import {
  getHeroImageUrl,
  assignHero,
  clearHero,
  getAllHeroAssignments,
} from "./hero-images";

const fixturesRoot = path.join(os.tmpdir(), "mmp-hero-images-test-fixtures");
const assignmentsPath = path.join(fixturesRoot, "hero-assignments.json");
const metadataPath = path.join(fixturesRoot, "media.json");
const uploadsDir = path.join(fixturesRoot, "uploads");

beforeEach(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
  fs.mkdirSync(fixturesRoot, { recursive: true });
});

afterAll(() => {
  fs.rmSync(fixturesRoot, { recursive: true, force: true });
});

describe("getHeroImageUrl", () => {
  it("returns null when the slug has no assignment file yet", () => {
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });

  it("returns null when the slug has no assignment", () => {
    assignHero("tree-service-marietta-ga", "some-id", assignmentsPath);
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });

  it("returns the assigned media's URL", () => {
    const item = saveMediaFile(
      "canton-oak.jpg",
      Buffer.from("x"),
      "A big oak in Canton",
      [],
      metadataPath,
      uploadsDir
    );
    assignHero("tree-service-canton-ga", item.id, assignmentsPath);

    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBe(
      item.url
    );
  });

  it("returns null if the assigned media id no longer exists", () => {
    assignHero("tree-service-canton-ga", "deleted-media-id", assignmentsPath);
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });
});

describe("assignHero / clearHero", () => {
  it("assignHero overwrites a previous assignment for the same slug", () => {
    const first = saveMediaFile("a.jpg", Buffer.from("a"), "alt a", [], metadataPath, uploadsDir);
    const second = saveMediaFile("b.jpg", Buffer.from("b"), "alt b", [], metadataPath, uploadsDir);

    assignHero("tree-service-canton-ga", first.id, assignmentsPath);
    assignHero("tree-service-canton-ga", second.id, assignmentsPath);

    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBe(
      second.url
    );
  });

  it("clearHero removes the assignment", () => {
    const item = saveMediaFile("a.jpg", Buffer.from("a"), "alt", [], metadataPath, uploadsDir);
    assignHero("tree-service-canton-ga", item.id, assignmentsPath);
    clearHero("tree-service-canton-ga", assignmentsPath);
    expect(getHeroImageUrl("tree-service-canton-ga", assignmentsPath, metadataPath)).toBeNull();
  });

  it("clearHero on a slug with no assignment is a no-op, not an error", () => {
    expect(() => clearHero("never-assigned-slug", assignmentsPath)).not.toThrow();
  });
});

describe("getAllHeroAssignments", () => {
  it("returns an empty object when no file exists yet", () => {
    expect(getAllHeroAssignments(assignmentsPath)).toEqual({});
  });

  it("returns every slug->mediaId assignment", () => {
    assignHero("tree-service-canton-ga", "id-1", assignmentsPath);
    assignHero("tree-removal-marietta-ga", "id-2", assignmentsPath);
    expect(getAllHeroAssignments(assignmentsPath)).toEqual({
      "tree-service-canton-ga": "id-1",
      "tree-removal-marietta-ga": "id-2",
    });
  });
});
