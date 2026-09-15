import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

// Playwright's test process doesn't load .env.local the way `next` does —
// read it manually so ADMIN_PASSWORD is available here too, the same way
// media-admin.spec.ts already does for its own Supabase env vars.
function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
loadEnvLocal();

// Logs into the /admin/* CMS before a test touches a protected route. Needs
// ADMIN_PASSWORD set in the environment running the e2e suite (same value
// the deployed site's ADMIN_PASSWORD env var holds, or any value you've set
// locally for `npm run dev` / `next start`, e.g. in .env.local).
export async function loginAsAdmin(page: Page): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not set — the e2e suite needs it to log into /admin routes."
    );
  }

  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();
}
