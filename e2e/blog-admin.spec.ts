// e2e/blog-admin.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { loginAsAdmin } from "./helpers/adminAuth";

test("creating a post via admin makes it live on the blog", async ({ page }) => {
  const uniqueSlug = `e2e-test-post-${Date.now()}`;
  const postFilePath = path.join(process.cwd(), "content/blog/posts", `${uniqueSlug}.md`);

  try {
    await loginAsAdmin(page);
    await page.goto("/admin/blog/new");

    await page.getByLabel("Title", { exact: true }).fill("E2E Test Post");
    await page.getByLabel("URL Slug").fill(uniqueSlug);
    await page
      .getByLabel("Cover Image URL")
      .fill("https://images.unsplash.com/photo-1441974231531-c6227db76b6e");
    await page.getByLabel("Cover Image Alt Text").fill("An e2e test cover photo");
    await page.getByLabel("Category").fill("Tree Care Tips");
    await page.getByLabel("Tags").fill("oak, pruning");
    await page.getByLabel("Excerpt").fill("An excerpt written by the e2e test.");
    await page.getByLabel("SEO Title").fill("E2E Test Post SEO Title");
    await page.getByLabel("SEO Description").fill("E2E test post SEO description.");
    await page.getByLabel("Body (Markdown)").fill(
      "This is the body.\n\n" +
        "[Tree Removal](/tree-removal-canton-ga) [Tree Trimming](/tree-trimming-canton-ga) " +
        "[Stump Grinding](/stump-grinding-canton-ga) [Lot Clearing](/lot-clearing-canton-ga) " +
        "[Emergency Service](/emergency-tree-service-canton-ga)\n\n" +
        "[ISA](https://www.isa-arbor.com/) [BBB](https://www.bbb.org/) " +
        "[Georgia Forestry](https://gatrees.org/) [Cherokee County](https://www.cherokeega.com/) " +
        "[NOAA](https://www.weather.gov/)"
    );

    await expect(page.getByText("Internal links: 5/5 ✓")).toBeVisible();
    await expect(page.getByText("External links: 5/5 ✓")).toBeVisible();

    await page.getByRole("button", { name: "Publish Post" }).click();

    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}`));
    await expect(page.getByRole("heading", { name: "E2E Test Post" })).toBeVisible();

    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "E2E Test Post" })).toBeVisible();
  } finally {
    if (fs.existsSync(postFilePath)) {
      fs.unlinkSync(postFilePath);
    }
  }
});

test("editing a post keeps its slug and updates its content", async ({ page }) => {
  const uniqueSlug = `e2e-edit-post-${Date.now()}`;
  const postFilePath = path.join(process.cwd(), "content/blog/posts", `${uniqueSlug}.md`);

  try {
    await loginAsAdmin(page);
    await page.goto("/admin/blog/new");
    await page.getByLabel("Title", { exact: true }).fill("Original Title");
    await page.getByLabel("URL Slug").fill(uniqueSlug);
    await page.getByLabel("Cover Image URL").fill("https://example.com/x.jpg");
    await page.getByLabel("Cover Image Alt Text").fill("Original alt text");
    await page.getByLabel("Category").fill("Company News");
    await page.getByLabel("Excerpt").fill("Original excerpt.");
    await page.getByLabel("SEO Title").fill("Original SEO Title");
    await page.getByLabel("SEO Description").fill("Original SEO description.");
    await page.getByLabel("Body (Markdown)").fill("Original body.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}`));

    await page.goto(`/admin/blog/${uniqueSlug}/edit`);
    await expect(page.getByLabel("URL Slug")).toHaveAttribute("readonly", "");
    await page.getByLabel("Title", { exact: true }).fill("Updated Title");
    await page.getByLabel("Body (Markdown)").fill("Updated body.");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(new RegExp(`/blog/${uniqueSlug}$`));
    await expect(page.getByRole("heading", { name: "Updated Title" })).toBeVisible();
    await expect(page.getByText("Updated body.")).toBeVisible();
  } finally {
    if (fs.existsSync(postFilePath)) {
      fs.unlinkSync(postFilePath);
    }
  }
});
