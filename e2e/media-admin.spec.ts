// e2e/media-admin.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const TEST_JPG_BASE64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

// Playwright's test process doesn't load .env.local the way `next` does —
// read it manually so this file can talk to Supabase directly for cleanup.
function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadEnvLocal();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

// Safety-net cleanup: scrubs any media row (and its uploaded storage file and
// hero assignment) whose generated filename starts with the given fixture
// base name. This matters because a test that fails partway through
// (e.g. on an assertion after the upload has already landed) would
// otherwise skip its own admin-UI cleanup steps and leave a stale row in the
// real, shared Supabase project — not a disposable test database. Wrapped in
// try/catch so a cleanup failure never masks the original test failure.
async function cleanupOrphanedMedia(fixtureBaseName: string): Promise<void> {
  try {
    const { data: items } = await supabase.from("media").select("id, filename");
    const orphans = (items ?? []).filter((item) =>
      item.filename.startsWith(`${fixtureBaseName}-`)
    );
    if (orphans.length === 0) return;

    await supabase.storage.from("media").remove(orphans.map((o) => o.filename));
    await supabase.from("hero_assignments").delete().in(
      "media_id",
      orphans.map((o) => o.id)
    );
    await supabase.from("media").delete().in("id", orphans.map((o) => o.id));
  } catch {
    // Best-effort only — never let cleanup itself fail the test.
  }
}

test.describe("media library admin", () => {
  let uploadedFilePath: string | null = null;

  test.afterEach(() => {
    // Best-effort cleanup: the uploaded file's on-disk name isn't known
    // ahead of time (it's generated server-side), so this only guards the
    // one fixture path we explicitly create below for the upload input.
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  });

  test("upload an image, tag it for Our Work, and see it live", async ({ page }) => {
    const fixturePath = path.join(process.cwd(), "e2e-fixture-upload.jpg");
    fs.writeFileSync(fixturePath, Buffer.from(TEST_JPG_BASE64, "base64"));
    uploadedFilePath = fixturePath;

    try {
      await page.goto("/admin/media");
      await page.setInputFiles("#file", fixturePath);
      await page.getByLabel("Alt Text").fill("E2E test job photo");
      await page.getByRole("button", { name: "Upload Image" }).click();

      await expect(page).toHaveURL(/\/admin\/media$/);
      await expect(page.getByText("E2E test job photo")).toBeVisible();

      const card = page.locator(".card", { hasText: "E2E test job photo" });
      await card.getByRole("button", { name: "Show on Our Work" }).click();

      // The Server Action's redirect() target is the page we're already on
      // (/admin/media), so asserting the URL here is a no-op that resolves
      // before the mutation has actually landed. Wait on a concrete DOM
      // signal instead (the button flipping to "Remove from Our Work") so
      // the subsequent navigation to /our-work doesn't race an in-flight
      // client-side refresh of this page, which was intermittently causing
      // net::ERR_ABORTED on the /our-work navigation.
      await expect(card.getByRole("button", { name: "Remove from Our Work" })).toBeVisible();

      await page.goto("/our-work");
      await expect(page.getByAltText("E2E test job photo")).toBeVisible();

      // Clean up via the admin UI itself so the metadata file and uploaded
      // file both stay in sync (a raw fs.unlink would leave a stale
      // media.json entry pointing at a deleted file).
      await page.goto("/admin/media");
      await page
        .locator(".card", { hasText: "E2E test job photo" })
        .getByRole("button", { name: "Delete" })
        .click();
      await expect(page).toHaveURL(/\/admin\/media$/);
      await expect(page.getByText("E2E test job photo")).not.toBeVisible();
    } finally {
      // Safety net: if an assertion above failed before the admin-UI delete
      // ran, this scrubs the real content/media/media.json and
      // public/uploads/ store so the failure doesn't leave permanent debris
      // in tracked, file-based CMS content.
      await cleanupOrphanedMedia("e2e-fixture-upload");
    }
  });

  test("assign an uploaded image as a city page's hero", async ({ page }) => {
    const fixturePath = path.join(process.cwd(), "e2e-fixture-hero.jpg");
    fs.writeFileSync(fixturePath, Buffer.from(TEST_JPG_BASE64, "base64"));
    uploadedFilePath = fixturePath;

    try {
      await page.goto("/admin/media");
      await page.setInputFiles("#file", fixturePath);
      await page.getByLabel("Alt Text").fill("E2E hero test photo");
      await page.getByRole("button", { name: "Upload Image" }).click();

      const card = page.locator(".card", { hasText: "E2E hero test photo" });
      await card.locator("select").selectOption("tree-service-canton-ga");
      await card.getByRole("button", { name: "Assign Hero" }).click();

      await expect(page).toHaveURL(/\/admin\/media$/);
      await expect(page.getByText("Currently hero for: tree-service-canton-ga")).toBeVisible();

      await page.goto("/tree-service-canton-ga");
      const heroBackgroundImage = await page
        .locator(".hero")
        .evaluate((el) => getComputedStyle(el).backgroundImage);
      // The generated filename is derived from the uploaded file's original
      // name ("e2e-fixture-hero.jpg"), not from the alt text entered above —
      // saveMediaFile() in lib/media.ts slugifies the original filename and
      // appends an 8-char id, e.g. "e2e-fixture-hero-a1b2c3d4.jpg".
      expect(heroBackgroundImage).toContain("e2e-fixture-hero");

      // Clear the assignment and delete the media so the fixture doesn't
      // leak into later test runs against the same dev server.
      await page.goto("/admin/media");
      const cleanupCard = page.locator(".card", { hasText: "E2E hero test photo" });
      await cleanupCard.getByRole("button", { name: "Clear Hero" }).click();

      // Same race class as Fix A above: the Clear Hero Server Action's
      // redirect() target is the page we're already on, so clicking
      // straight into Delete without waiting risks racing the in-flight
      // client-side refresh. Wait for a concrete DOM signal that the
      // mutation actually landed (the "Currently hero for: ..." block
      // disappearing from this card) before clicking Delete.
      await expect(cleanupCard.getByText(/Currently hero for:/)).not.toBeVisible();

      await cleanupCard.getByRole("button", { name: "Delete" }).click();
    } finally {
      // Safety net: if an assertion above failed before the admin-UI
      // clear/delete ran, this scrubs the real content/media/media.json,
      // content/media/hero-assignments.json, and public/uploads/ store so
      // the failure doesn't leave permanent debris in tracked, file-based
      // CMS content.
      await cleanupOrphanedMedia("e2e-fixture-hero");
    }
  });
});
