// e2e/nav-and-pages.spec.ts
import { test, expect } from "@playwright/test";

test("home page loads with hero and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /north georgia/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /get a free estimate/i }).first()).toBeVisible();
});

test("Canton hub page links to all 5 service pages", async ({ page }) => {
  await page.goto("/tree-service-canton-ga");
  await expect(page.getByRole("heading", { name: /tree service in canton/i })).toBeVisible();
  for (const slug of [
    "tree-removal-canton-ga",
    "tree-trimming-canton-ga",
    "stump-grinding-canton-ga",
    "lot-clearing-canton-ga",
    "emergency-tree-service-canton-ga",
  ]) {
    // The header's mega-menu also carries a same-href link to every Canton
    // service page (by design, see SiteHeader/task 7), and it sits earlier
    // in the DOM than the page body while being display:none until hovered.
    // Filter to the :visible match so this asserts the page-body link,
    // which is what a real visitor can actually see and click.
    await expect(page.locator(`a[href="/${slug}"]:visible`).first()).toBeVisible();
  }
});

test("a Canton service page renders FAQs and the map embed", async ({ page }) => {
  await page.goto("/tree-removal-canton-ga");
  // Scope to the h1: the FAQ section's h2 ("Tree Removal in Canton, GA:
  // Common Questions") legitimately repeats the same service+city phrase.
  await expect(
    page.getByRole("heading", { level: 1, name: /tree removal in canton/i })
  ).toBeVisible();
  await expect(page.locator(".faq-item").first()).toBeVisible();
  await expect(page.locator(".map-embed iframe")).toBeVisible();
});

test("service area index lists 27 cities, only built cities linked", async ({ page }) => {
  await page.goto("/service-areas");
  await expect(page.locator(".area-chip")).toHaveCount(27);
  // Built cities as of this test: Canton, Marietta, Woodstock, Alpharetta,
  // Roswell, Sandy Springs, Kennesaw, Dunwoody, Smyrna, Milton, Norcross,
  // Lilburn, Duluth, Vinings, Atlanta, Avondale Estates, Buford, Suwanee,
  // Johns Creek. Update this count (and lib/cities.test.ts's matching
  // assertion) when a new city's isBuilt flag flips to true.
  await expect(page.locator("a.area-chip")).toHaveCount(19);
});

test("nav mega-menu reaches a Canton service page", async ({ page }) => {
  await page.goto("/");
  // The home page body also has several "Canton, GA" / "Tree Trimming"
  // links of its own (service cards, area chips, footer), so an unscoped
  // getByRole(/canton, ga/i) matches many elements at once. Scope every
  // lookup to the "Service Area" mega-menu panel so this test exercises
  // nav hover navigation specifically, not whichever link happens to match
  // first on the page.
  const serviceAreaMenu = page.locator(".dropdown", { hasText: "Service Area" });
  await serviceAreaMenu.getByText("Service Area", { exact: true }).hover();
  await serviceAreaMenu.getByRole("link", { name: /canton, ga/i }).hover();
  await serviceAreaMenu.getByRole("link", { name: /tree trimming/i }).first().click();
  await expect(page).toHaveURL(/tree-trimming-canton-ga/);
});

test("about, testimonials, contact, our-work, and blog all load", async ({ page }) => {
  for (const path of ["/about", "/testimonials", "/contact", "/our-work", "/blog"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
  }
});
