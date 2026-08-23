import path from "node:path";
import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
    // Playwright specs live under e2e/ and are run via `npm run e2e`, not
    // vitest — exclude them so vitest doesn't try to load @playwright/test.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
