// e2e/blog-category-filter.spec.ts
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

test("filtering the blog index by category shows only matching posts", async ({ page }) => {
  const slugA = `e2e-category-a-${Date.now()}`;
  const slugB = `e2e-category-b-${Date.now()}`;
  const pathA = path.join(process.cwd(), "content/blog/posts", `${slugA}.md`);
  const pathB = path.join(process.cwd(), "content/blog/posts", `${slugB}.md`);

  try {
    await page.goto("/admin/blog/new");
    await page.getByLabel("Title", { exact: true }).fill("Storm Post For Filter Test");
    await page.getByLabel("URL Slug").fill(slugA);
    await page.getByLabel("Cover Image URL").fill("https://example.com/a.jpg");
    await page.getByLabel("Cover Image Alt Text").fill("Alt A");
    await page.getByLabel("Category").fill("Storm Safety");
    await page.getByLabel("Excerpt").fill("Excerpt A.");
    await page.getByLabel("SEO Title").fill("SEO A");
    await page.getByLabel("SEO Description").fill("Desc A.");
    await page.getByLabel("Body (Markdown)").fill("Body A.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${slugA}`));

    await page.goto("/admin/blog/new");
    await page.getByLabel("Title", { exact: true }).fill("Company Post For Filter Test");
    await page.getByLabel("URL Slug").fill(slugB);
    await page.getByLabel("Cover Image URL").fill("https://example.com/b.jpg");
    await page.getByLabel("Cover Image Alt Text").fill("Alt B");
    await page.getByLabel("Category").fill("Company News");
    await page.getByLabel("Excerpt").fill("Excerpt B.");
    await page.getByLabel("SEO Title").fill("SEO B");
    await page.getByLabel("SEO Description").fill("Desc B.");
    await page.getByLabel("Body (Markdown)").fill("Body B.");
    await page.getByRole("button", { name: "Publish Post" }).click();
    await expect(page).toHaveURL(new RegExp(`/blog/${slugB}`));

    await page.goto("/blog?category=Storm%20Safety");
    await expect(page.getByRole("heading", { name: "Storm Post For Filter Test" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Company Post For Filter Test" })
    ).not.toBeVisible();

    await page.getByRole("link", { name: "All", exact: true }).click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { name: "Storm Post For Filter Test" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Company Post For Filter Test" })
    ).toBeVisible();
  } finally {
    if (fs.existsSync(pathA)) fs.unlinkSync(pathA);
    if (fs.existsSync(pathB)) fs.unlinkSync(pathB);
  }
});
