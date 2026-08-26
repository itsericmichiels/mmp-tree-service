import { test, expect } from "@playwright/test";

test("keyboard-only user can open the Services dropdown and reach a link", async ({ page }) => {
  await page.goto("/");

  // Tab from the top of the page until the "Services" trigger button has
  // focus. Give this a generous cap so a regression doesn't hang the test.
  let focused = "";
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    focused = (await page.evaluate(() => document.activeElement?.textContent || "")).trim();
    if (focused === "Services") break;
  }
  expect(focused).toBe("Services");

  // Panel should be closed before activation.
  const panel = page.locator("#nav-services-panel");
  await expect(panel).not.toHaveClass(/is-open/);

  // Activate with keyboard (Enter) - no mouse involved anywhere in this test.
  await page.keyboard.press("Enter");
  await expect(panel).toHaveClass(/is-open/);

  // Continue tabbing into the panel and confirm we land on a real,
  // clickable/activatable link inside it.
  await page.keyboard.press("Tab");
  const nextFocused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    href: (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href"),
    text: document.activeElement?.textContent?.trim(),
  }));
  expect(nextFocused.tag).toBe("A");
  // The top-level "Services" dropdown points at each service's general
  // (non-city) page now that all 5 have one.
  expect(nextFocused.href).toBe("/tree-removal");

  // Activate that link via keyboard and confirm real navigation occurs.
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tree-removal$/);
});

test("Escape closes an open dropdown", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Services" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const panel = page.locator("#nav-services-panel");
  await expect(panel).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  await expect(panel).not.toHaveClass(/is-open/);
});

test("mobile hamburger reveals a working nav", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const links = page.locator("#nav-links");
  await expect(links).not.toHaveClass(/is-open/);
  // The full nav should not be visible pre-toggle at this width.
  await expect(page.getByRole("link", { name: "About" })).not.toBeVisible();

  const toggle = page.getByRole("button", { name: /open navigation menu/i });
  await toggle.click();
  await expect(links).toHaveClass(/is-open/);
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();

  // A link within the now-visible mobile menu should actually navigate.
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about/);
});
