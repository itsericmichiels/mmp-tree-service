# MMP Tree Service — Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Next.js foundation for the MMP Tree Service rebuild: data-driven mega-menu navigation, shared layout/components, and a fully-built Canton page set (hub + 5 service pages), replacing the retired static-HTML prototype.

**Architecture:** Next.js App Router + TypeScript, statically generated. Two data files (`lib/cities.ts`, `lib/services.ts`) drive navigation and routing; a single dynamic route (`app/[slug]/page.tsx`) resolves flat SEO slugs to either a city-hub or service+city template. Content for built pages lives in typed data objects (`content/canton.ts`), kept separate from presentation components.

**Tech Stack:** Next.js (latest, App Router), TypeScript, plain CSS (global stylesheet, no Tailwind — ports the already-approved design system from the retired static prototype), Vitest (unit tests), Playwright (e2e smoke tests) — matching the tooling pattern already used in the sibling `fusades` project.

**Spec:** `docs/superpowers/specs/2026-08-15-mmp-site-foundation-design.md`

## Global Constraints

- URL slugs are flat, not nested: city hub = `tree-service-{city}-ga`, service+city = `{service}-{city}-ga`. (Spec §URL strategy)
- The 5 services, fixed set: Tree Removal (`tree-removal`), Tree Trimming (`tree-trimming`), Stump Grinding (`stump-grinding`), Lot Clearing (`lot-clearing`), Emergency Tree Service (`emergency-tree-service`). (Spec §Data model)
- All 27 live-site cities are entered in `lib/cities.ts`; only Canton has `isBuilt: true` in this plan. (Spec §Data model)
- Un-built city/service combinations never render a link or a route — the menu only shows what exists. (Spec §Data model)
- Every page includes the Google Maps embed (exact iframe below) and the `<EstimateForm>` widget. (Spec §Shared components)
- `form_embed.js` loads exactly once, in the root layout — never per-page. (Spec §Shared components)
- CTA copy is always "Get a Free Estimate"; CTA color is orange (`--orange: #F2791D`) and used for no other purpose. (Carried from original brief)
- Design must be visually compelling on every page, not merely functional — real photography over generic stock where MMP's own photos exist, confident typography, no page that reads as a template with the city name swapped in. (User directive, 2026-08-23)
- Google Maps iframe (use verbatim on every page):
  ```html
  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.3016085594863!2d-84.6792009871628!3d34.03613357305119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f59f0efaae4077%3A0xd48d5e173cc2099!2sMMP%20Tree%20Service%20LLC!5e0!3m2!1sen!2ses!4v1787495303171!5m2!1sen!2ses" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
  ```
- Estimate form widget (use verbatim, iframe per page + script once):
  ```html
  <iframe
      src="https://link.contentcreatormachine.com/widget/form/YGc0izXgK5e9BeLVlDvU"
      style="width:100%;height:100%;border:none;border-radius:3px"
      id="inline-YGc0izXgK5e9BeLVlDvU"
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name="Request a Free Estimate MMP Tree Service LLC"
      data-height="1125"
      data-layout-iframe-id="inline-YGc0izXgK5e9BeLVlDvU"
      data-form-id="YGc0izXgK5e9BeLVlDvU"
      title="Request a Free Estimate MMP Tree Service LLC"
  ></iframe>
  <script src="https://link.contentcreatormachine.com/js/form_embed.js"></script>
  ```
- Business contact info (verbatim everywhere): Phone `(470) 403-0215` / `tel:4704030215`; Email `mmptreeservicellc@gmail.com`; Address `3330 Cobb Pkwy NW STE 324, Acworth, GA 30101`; hours `24/7 Emergency Service`.

---

## File Structure

```
site/
  lib/
    services.ts          # SERVICES data + Service type
    cities.ts             # CITIES data + City type
    slugs.ts               # citySlug(), serviceCitySlug(), resolveSlug()
    slugs.test.ts
    cities.test.ts
  content/
    canton.ts              # CantonContent: hub copy + 5 service-page copy blocks
  components/
    SiteHeader.tsx          # mega-menu, data-driven
    SiteFooter.tsx
    StickyCta.tsx
    MapEmbed.tsx
    EstimateForm.tsx
    ServiceCard.tsx
    AreaChip.tsx
    TestimonialCard.tsx
    CityHubTemplate.tsx     # renders a city hub page from data
    ServiceCityTemplate.tsx # renders a service+city page from data
  app/
    layout.tsx
    globals.css
    page.tsx                # Home
    service-areas/page.tsx
    about/page.tsx
    testimonials/page.tsx
    contact/page.tsx
    our-work/page.tsx
    blog/page.tsx
    [slug]/page.tsx         # resolves to CityHubTemplate or ServiceCityTemplate
  e2e/
    nav-and-pages.spec.ts
```

---

### Task 1: Scaffold the Next.js project

**Files:**
- Create: entire Next.js scaffold (package.json, tsconfig.json, next.config.ts, app/layout.tsx, app/page.tsx, app/globals.css, eslint config, .gitignore)

**Interfaces:**
- Consumes: nothing
- Produces: `npm run dev`, `npm run build`, `npm test` (vitest), `npm run e2e` (playwright) scripts for every later task to rely on

- [ ] **Step 1: Temporarily move the existing docs/ folder aside so create-next-app sees an empty-enough directory**

```bash
cd /Users/ericmichiels/Claude/Sites/mmp-tree-service/site
mv docs /tmp/mmp-site-docs-backup
```

- [ ] **Step 2: Run create-next-app non-interactively**

```bash
npx create-next-app@latest . --typescript --eslint --app --no-tailwind --no-src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 3: Restore the docs folder**

```bash
mv /tmp/mmp-site-docs-backup docs
```

- [ ] **Step 4: Add Vitest and Playwright**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 5: Add `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 6: Add `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: "http://localhost:3000" },
});
```

- [ ] **Step 7: Add `test` and `e2e` scripts to `package.json`**

Add to the `"scripts"` object:
```json
"test": "vitest run",
"e2e": "playwright test"
```

- [ ] **Step 8: Verify the scaffold builds and runs**

```bash
npm run build
```
Expected: build succeeds with the default Next.js starter page.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app with Vitest and Playwright"
```

---

### Task 2: Services data layer

**Files:**
- Create: `lib/services.ts`
- Test: `lib/services.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `type Service = { slug: string; name: string; shortDescription: string; icon: string }`, `SERVICES: Service[]` — consumed by Task 4 (slugs), Task 7 (SiteHeader), Task 12 (content), Task 14 (ServiceCityTemplate)

- [ ] **Step 1: Write the failing test**

```ts
// lib/services.test.ts
import { describe, it, expect } from "vitest";
import { SERVICES } from "./services";

describe("SERVICES", () => {
  it("has exactly the 5 fixed services", () => {
    expect(SERVICES.map((s) => s.slug).sort()).toEqual(
      [
        "tree-removal",
        "tree-trimming",
        "stump-grinding",
        "lot-clearing",
        "emergency-tree-service",
      ].sort()
    );
  });

  it("every service has a non-empty name, description, and icon", () => {
    for (const s of SERVICES) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.shortDescription.length).toBeGreaterThan(0);
      expect(s.icon.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/services.test.ts
```
Expected: FAIL — `lib/services.ts` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
// lib/services.ts
export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
};

export const SERVICES: Service[] = [
  {
    slug: "tree-removal",
    name: "Tree Removal",
    shortDescription:
      "Safe, professional removal for trees of any size or condition.",
    icon: "tree-removal",
  },
  {
    slug: "tree-trimming",
    name: "Tree Trimming",
    shortDescription:
      "Certified-arborist pruning that improves structure and long-term health.",
    icon: "tree-trimming",
  },
  {
    slug: "stump-grinding",
    name: "Stump Grinding",
    shortDescription:
      "Stumps ground below grade so you can reclaim your yard fast.",
    icon: "stump-grinding",
  },
  {
    slug: "lot-clearing",
    name: "Lot Clearing",
    shortDescription:
      "Complete vegetation removal and site prep for lots of any size.",
    icon: "lot-clearing",
  },
  {
    slug: "emergency-tree-service",
    name: "Emergency Tree Service",
    shortDescription:
      "24/7 storm response — dangerous trees removed fast, insurance-ready.",
    icon: "emergency",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/services.test.ts
```
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/services.ts lib/services.test.ts
git commit -m "Add services data layer"
```

---

### Task 3: Cities data layer

**Files:**
- Create: `lib/cities.ts`
- Test: `lib/cities.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `type City = { slug: string; name: string; isBuilt: boolean }`, `CITIES: City[]` — consumed by Task 4 (slugs), Task 7 (SiteHeader), Task 11 (service-areas page)

- [ ] **Step 1: Write the failing test**

```ts
// lib/cities.test.ts
import { describe, it, expect } from "vitest";
import { CITIES } from "./cities";

describe("CITIES", () => {
  it("has all 27 cities from the live service-area list", () => {
    expect(CITIES).toHaveLength(27);
  });

  it("every slug is unique", () => {
    const slugs = CITIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only Canton is built", () => {
    const built = CITIES.filter((c) => c.isBuilt).map((c) => c.slug);
    expect(built).toEqual(["canton"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/cities.test.ts
```
Expected: FAIL — `lib/cities.ts` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
// lib/cities.ts
export type City = {
  slug: string;
  name: string;
  isBuilt: boolean;
};

const CITY_NAMES: string[] = [
  "Canton",
  "Norcross",
  "Lilburn",
  "Duluth",
  "Woodstock",
  "Vinings",
  "Marietta",
  "Atlanta",
  "Avondale Estates",
  "Buford",
  "Suwanee",
  "Johns Creek",
  "East Point",
  "Buckhead",
  "Roswell",
  "Dunwoody",
  "Cumming",
  "Decatur",
  "Kennesaw",
  "Lawrenceville",
  "Sandy Springs",
  "Smyrna",
  "Brookhaven",
  "Acworth",
  "Milton",
  "Powder Springs",
  "Alpharetta",
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export const CITIES: City[] = CITY_NAMES.map((name) => ({
  slug: slugify(name),
  name: `${name}, GA`,
  isBuilt: name === "Canton",
}));
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/cities.test.ts
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/cities.ts lib/cities.test.ts
git commit -m "Add cities data layer"
```

---

### Task 4: Slug resolution helpers

**Files:**
- Create: `lib/slugs.ts`
- Test: `lib/slugs.test.ts`

**Interfaces:**
- Consumes: `City` and `CITIES` from `lib/cities.ts`; `Service` and `SERVICES` from `lib/services.ts`
- Produces:
  - `citySlug(city: City): string`
  - `serviceCitySlug(service: Service, city: City): string`
  - `type ResolvedSlug = { type: "hub"; city: City } | { type: "service"; service: Service; city: City }`
  - `resolveSlug(slug: string): ResolvedSlug | null`
  - `builtSlugs(): string[]` — every routable slug for `generateStaticParams`, consumed by Task 15

- [ ] **Step 1: Write the failing test**

```ts
// lib/slugs.test.ts
import { describe, it, expect } from "vitest";
import { CITIES } from "./cities";
import { SERVICES } from "./services";
import { citySlug, serviceCitySlug, resolveSlug, builtSlugs } from "./slugs";

const canton = CITIES.find((c) => c.slug === "canton")!;
const treeRemoval = SERVICES.find((s) => s.slug === "tree-removal")!;

describe("citySlug", () => {
  it("builds the hub slug", () => {
    expect(citySlug(canton)).toBe("tree-service-canton-ga");
  });
});

describe("serviceCitySlug", () => {
  it("builds the service+city slug", () => {
    expect(serviceCitySlug(treeRemoval, canton)).toBe(
      "tree-removal-canton-ga"
    );
  });
});

describe("resolveSlug", () => {
  it("resolves a built hub slug", () => {
    const resolved = resolveSlug("tree-service-canton-ga");
    expect(resolved).toEqual({ type: "hub", city: canton });
  });

  it("resolves a built service+city slug", () => {
    const resolved = resolveSlug("tree-removal-canton-ga");
    expect(resolved).toEqual({ type: "service", service: treeRemoval, city: canton });
  });

  it("returns null for an un-built city", () => {
    expect(resolveSlug("tree-service-marietta-ga")).toBeNull();
    expect(resolveSlug("tree-removal-marietta-ga")).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(resolveSlug("not-a-real-slug")).toBeNull();
  });
});

describe("builtSlugs", () => {
  it("returns exactly Canton's hub + 5 service slugs", () => {
    expect(builtSlugs().sort()).toEqual(
      [
        "tree-service-canton-ga",
        "tree-removal-canton-ga",
        "tree-trimming-canton-ga",
        "stump-grinding-canton-ga",
        "lot-clearing-canton-ga",
        "emergency-tree-service-canton-ga",
      ].sort()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/slugs.test.ts
```
Expected: FAIL — `lib/slugs.ts` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
// lib/slugs.ts
import { CITIES, type City } from "./cities";
import { SERVICES, type Service } from "./services";

export function citySlug(city: City): string {
  return `tree-service-${city.slug}-ga`;
}

export function serviceCitySlug(service: Service, city: City): string {
  return `${service.slug}-${city.slug}-ga`;
}

export type ResolvedSlug =
  | { type: "hub"; city: City }
  | { type: "service"; service: Service; city: City };

export function resolveSlug(slug: string): ResolvedSlug | null {
  const builtCities = CITIES.filter((c) => c.isBuilt);

  for (const city of builtCities) {
    if (slug === citySlug(city)) {
      return { type: "hub", city };
    }
    for (const service of SERVICES) {
      if (slug === serviceCitySlug(service, city)) {
        return { type: "service", service, city };
      }
    }
  }

  return null;
}

export function builtSlugs(): string[] {
  const builtCities = CITIES.filter((c) => c.isBuilt);
  const slugs: string[] = [];
  for (const city of builtCities) {
    slugs.push(citySlug(city));
    for (const service of SERVICES) {
      slugs.push(serviceCitySlug(service, city));
    }
  }
  return slugs;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run lib/slugs.test.ts
```
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/slugs.ts lib/slugs.test.ts
git commit -m "Add slug resolution helpers"
```

---

### Task 5: Design tokens and base styles (`globals.css`)

**Files:**
- Modify: `app/globals.css` (replace create-next-app's default content entirely)

**Interfaces:**
- Consumes: nothing
- Produces: CSS custom properties and utility classes (`.container`, `.btn`, `.btn-orange`, `.hero`, `.card`, `.grid--3`, `.area-chip`, `.sticky-cta`, `.site-header`, `.nav__*`, `.section`, `.map-embed`, `.estimate-panel`, `.testi-card`, `.faq-item`, `.check-list`) — consumed by every component task (6–15)

- [ ] **Step 1: Port the design system from the retired static prototype**

Copy the full contents of
`/Users/ericmichiels/Claude/Sites/mmp-tree-service/redesign/assets/css/style.css`
into `app/globals.css` verbatim — it already implements every token and
class this plan's components rely on (brand colors, buttons, hero,
cards, mega-menu-ready nav shell, sticky CTA, map/estimate layout, area
grid, footer, responsive breakpoints).

```bash
cp /Users/ericmichiels/Claude/Sites/mmp-tree-service/redesign/assets/css/style.css \
   /Users/ericmichiels/Claude/Sites/mmp-tree-service/site/app/globals.css
```

- [ ] **Step 2: Add mega-menu-specific classes needed for Task 7's dropdown/flyout (not present in the ported file)**

Append to `app/globals.css`:

```css
/* Mega-menu dropdowns (Service Area: city -> flyout of services) ---------- */
.nav__links{ position:relative; }
.dropdown{ position:relative; }
.dropdown__panel{
  display:none;
  position:absolute;
  top:100%; left:0;
  background:#fff;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  border:1px solid var(--line);
  min-width: 260px;
  padding: 8px;
  z-index: 600;
}
.dropdown:hover .dropdown__panel,
.dropdown:focus-within .dropdown__panel{ display:block; }
.dropdown__row{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-weight:600;
  color: var(--ink);
  white-space: nowrap;
}
a.dropdown__row:hover{ background: var(--cream); color: var(--green-dark); }
.dropdown__row--muted{ color: var(--ink-soft); opacity:.55; cursor:default; }
.dropdown__row--muted:hover{ background:none; }
.dropdown__flyout{
  display:none;
  position:absolute;
  top:0; left:100%;
  background:#fff;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  border:1px solid var(--line);
  min-width: 240px;
  padding: 8px;
}
.dropdown__row:hover .dropdown__flyout,
.dropdown__row:focus-within .dropdown__flyout{ display:block; }
```

- [ ] **Step 3: Verify the app still builds**

```bash
npm run build
```
Expected: build succeeds (globals.css is valid CSS, no import errors).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "Port design system into globals.css and add mega-menu styles"
```

---

### Task 6: `MapEmbed` and `EstimateForm` components

**Files:**
- Create: `components/MapEmbed.tsx`
- Create: `components/EstimateForm.tsx`

**Interfaces:**
- Consumes: nothing (static embeds, per Global Constraints)
- Produces: `<MapEmbed />`, `<EstimateForm />` — consumed by Task 9 (layout, for the script tag), Task 10 (Home), Task 13 (CityHubTemplate), Task 14 (ServiceCityTemplate), Task 16 (Contact)

- [ ] **Step 1: Write `MapEmbed`**

```tsx
// components/MapEmbed.tsx
export function MapEmbed() {
  return (
    <div className="map-embed">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.3016085594863!2d-84.6792009871628!3d34.03613357305119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f59f0efaae4077%3A0xd48d5e173cc2099!2sMMP%20Tree%20Service%20LLC!5e0!3m2!1sen!2ses!4v1787495303171!5m2!1sen!2ses"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        title="MMP Tree Service LLC location map"
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `EstimateForm`**

```tsx
// components/EstimateForm.tsx
export function EstimateForm() {
  return (
    <div className="estimate-panel" style={{ minHeight: 1125 }}>
      <iframe
        src="https://link.contentcreatormachine.com/widget/form/YGc0izXgK5e9BeLVlDvU"
        style={{ width: "100%", height: "100%", border: "none", borderRadius: 3 }}
        id="inline-YGc0izXgK5e9BeLVlDvU"
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Request a Free Estimate MMP Tree Service LLC"
        data-height="1125"
        data-layout-iframe-id="inline-YGc0izXgK5e9BeLVlDvU"
        data-form-id="YGc0izXgK5e9BeLVlDvU"
        title="Request a Free Estimate MMP Tree Service LLC"
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds (no page references these yet, but TSX must compile cleanly — run `npx tsc --noEmit` if `next build` doesn't surface component-only errors).

- [ ] **Step 4: Commit**

```bash
git add components/MapEmbed.tsx components/EstimateForm.tsx
git commit -m "Add MapEmbed and EstimateForm components"
```

---

### Task 7: `SiteHeader` mega-menu component

**Files:**
- Create: `components/SiteHeader.tsx`
- Test: `components/SiteHeader.test.tsx`

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, `SERVICES` from `lib/services.ts`, `citySlug`/`serviceCitySlug` from `lib/slugs.ts`
- Produces: `<SiteHeader />` — consumed by Task 9 (root layout)

- [ ] **Step 1: Write the failing test**

```tsx
// components/SiteHeader.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders a link to Canton's hub page", () => {
    render(<SiteHeader />);
    const link = screen.getByRole("link", { name: /canton, ga/i });
    expect(link).toHaveAttribute("href", "/tree-service-canton-ga");
  });

  it("renders Canton's 5 services as flyout links", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /tree removal/i })).toHaveAttribute(
      "href",
      "/tree-removal-canton-ga"
    );
    expect(
      screen.getByRole("link", { name: /emergency tree service/i })
    ).toHaveAttribute("href", "/emergency-tree-service-canton-ga");
  });

  it("renders un-built cities as non-clickable text, not links", () => {
    render(<SiteHeader />);
    expect(
      screen.queryByRole("link", { name: /^marietta, ga$/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/marietta, ga/i)).toBeInTheDocument();
  });

  it("renders the always-visible phone number and CTA", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: /\(470\) 403-0215/i })).toHaveAttribute(
      "href",
      "tel:4704030215"
    );
    expect(
      screen.getByRole("link", { name: /get a free estimate/i })
    ).toHaveAttribute("href", "/contact");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run components/SiteHeader.test.tsx
```
Expected: FAIL — `components/SiteHeader.tsx` does not exist.

- [ ] **Step 3: Write the implementation**

```tsx
// components/SiteHeader.tsx
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { citySlug, serviceCitySlug } from "@/lib/slugs";

export function SiteHeader() {
  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar__item">
            📞 <a href="tel:4704030215">(470) 403-0215</a>
          </div>
          <div className="topbar__item">
            ✉️ <a href="mailto:mmptreeservicellc@gmail.com">mmptreeservicellc@gmail.com</a>
          </div>
          <div className="topbar__item">🕑 Available 24/7 for Emergencies</div>
        </div>
      </div>

      <header className="site-header">
        <nav className="nav container">
          <Link href="/" className="nav__brand">
            <img
              src="https://mmptreeservice.com/wp-content/uploads/2025/12/MMP-Tree-Service-logo.png"
              alt="MMP Tree Service LLC logo"
            />
            <span className="nav__brand-text">
              MMP Tree Service
              <small>Licensed &amp; Insured · North Georgia</small>
            </span>
          </Link>

          <div className="nav__links">
            <div className="dropdown">
              <span className="dropdown__row" style={{ cursor: "default" }}>
                Services
              </span>
              <div className="dropdown__panel">
                {SERVICES.map((service) => {
                  const canton = CITIES.find((c) => c.slug === "canton")!;
                  return (
                    <Link
                      key={service.slug}
                      href={`/${serviceCitySlug(service, canton)}`}
                      className="dropdown__row"
                    >
                      {service.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="dropdown">
              <span className="dropdown__row" style={{ cursor: "default" }}>
                Service Area
              </span>
              <div className="dropdown__panel">
                {CITIES.map((city) =>
                  city.isBuilt ? (
                    <Link
                      key={city.slug}
                      href={`/${citySlug(city)}`}
                      className="dropdown__row"
                    >
                      {city.name}
                      <div className="dropdown__flyout">
                        {SERVICES.map((service) => (
                          <Link
                            key={service.slug}
                            href={`/${serviceCitySlug(service, city)}`}
                            className="dropdown__row"
                          >
                            {service.name}
                          </Link>
                        ))}
                      </div>
                    </Link>
                  ) : (
                    <span
                      key={city.slug}
                      className="dropdown__row dropdown__row--muted"
                    >
                      {city.name}
                    </span>
                  )
                )}
              </div>
            </div>

            <Link href="/about">About</Link>
            <Link href="/our-work">Our Work</Link>
            <Link href="/testimonials">Testimonials</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className="nav__cta">
            <a href="tel:4704030215" className="nav__phone">
              (470) 403-0215
              <small>Call for a free quote</small>
            </a>
            <Link href="/contact" className="btn btn-orange btn-sm">
              Get a Free Estimate
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run components/SiteHeader.test.tsx
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/SiteHeader.tsx components/SiteHeader.test.tsx
git commit -m "Add data-driven SiteHeader mega-menu"
```

---

### Task 8: `SiteFooter` and `StickyCta` components

**Files:**
- Create: `components/SiteFooter.tsx`
- Create: `components/StickyCta.tsx`

**Interfaces:**
- Consumes: nothing (static content, fixed contact info)
- Produces: `<SiteFooter />`, `<StickyCta />` — consumed by Task 9 (root layout)

- [ ] **Step 1: Write `StickyCta`**

```tsx
// components/StickyCta.tsx
import Link from "next/link";

export function StickyCta() {
  return (
    <div className="sticky-cta">
      <a href="tel:4704030215" className="sticky-cta__call">
        📞 Call (470) 403-0215
      </a>
      <Link href="/contact" className="sticky-cta__estimate">
        Get a Free Estimate
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Write `SiteFooter`**

```tsx
// components/SiteFooter.tsx
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img
                src="https://mmptreeservice.com/wp-content/uploads/2025/12/MMP-Tree-Service-logo.png"
                alt="MMP Tree Service logo"
              />
              <strong>MMP Tree Service LLC</strong>
            </div>
            <p>
              Licensed, insured, and family-owned — providing professional
              tree removal, trimming, stump grinding, and emergency tree
              care across North Metro Atlanta.
            </p>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link href="/tree-removal-canton-ga">Tree Removal</Link></li>
              <li><Link href="/tree-trimming-canton-ga">Tree Trimming</Link></li>
              <li><Link href="/stump-grinding-canton-ga">Stump Grinding</Link></li>
              <li><Link href="/lot-clearing-canton-ga">Lot Clearing</Link></li>
              <li><Link href="/emergency-tree-service-canton-ga">Emergency Tree Service</Link></li>
            </ul>
          </div>
          <div>
            <h4>Service Areas</h4>
            <ul>
              <li><Link href="/tree-service-canton-ga">Canton, GA</Link></li>
              <li><Link href="/service-areas">See all 27 cities →</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>📞 <a href="tel:4704030215">(470) 403-0215</a></li>
              <li>✉️ <a href="mailto:mmptreeservicellc@gmail.com">mmptreeservicellc@gmail.com</a></li>
              <li>📍 3330 Cobb Pkwy NW STE 324, Acworth, GA 30101</li>
              <li>🕑 Available 24/7 for emergencies</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MMP Tree Service LLC. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/SiteFooter.tsx components/StickyCta.tsx
git commit -m "Add SiteFooter and StickyCta components"
```

---

### Task 9: Root layout wiring

**Files:**
- Modify: `app/layout.tsx` (replace create-next-app's default entirely)

**Interfaces:**
- Consumes: `<SiteHeader />`, `<SiteFooter />`, `<StickyCta />` (Tasks 7–8)
- Produces: the shared shell every page task (10, 11, 13, 14, 16, 17) renders inside

- [ ] **Step 1: Write the root layout**

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StickyCta } from "@/components/StickyCta";
import "./globals.css";

export const metadata: Metadata = {
  title: "MMP Tree Service LLC | North Metro Atlanta Tree Care",
  description:
    "Licensed & insured tree removal, trimming, stump grinding, and 24/7 emergency tree service across North Metro Atlanta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <StickyCta />
        <Script
          src="https://link.contentcreatormachine.com/js/form_embed.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Delete the create-next-app default page content (Home is written fresh in Task 10)**

```bash
rm -f app/page.module.css
```

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds (Home may still be the create-next-app placeholder until Task 10 — that's fine for this task).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Wire SiteHeader, SiteFooter, StickyCta, and form_embed.js into root layout"
```

---

### Task 10: Home page

**Files:**
- Modify: `app/page.tsx` (replace entirely)

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, `SERVICES` from `lib/services.ts`, `citySlug`/`serviceCitySlug` from `lib/slugs.ts`, `<MapEmbed />`/`<EstimateForm />` from Task 6
- Produces: the `/` route, linked from Task 7's brand logo and Task 8's footer

- [ ] **Step 1: Write the Home page**

Port the hero, services grid, why-choose-us, testimonials, service-area
teaser, and estimate sections from the retired static prototype's
`Sites/mmp-tree-service/redesign/index.html`, converted to JSX and wired
to real data instead of hard-coded links:

```tsx
// app/page.tsx
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { serviceCitySlug } from "@/lib/slugs";
import { SERVICES } from "@/lib/services";
import { MapEmbed } from "@/components/MapEmbed";
import { EstimateForm } from "@/components/EstimateForm";

const canton = CITIES.find((c) => c.slug === "canton")!;

export default function HomePage() {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="container hero__content">
          <h1>North Georgia&apos;s Most Trusted Tree Service</h1>
          <p className="lead">
            Family-owned, ISA-certified, and fully licensed &amp; insured —
            MMP Tree Service handles tree removal, trimming, stump
            grinding, and 24/7 emergency response across North Metro
            Atlanta.
          </p>
          <div className="hero__actions">
            <Link href="/contact" className="btn btn-orange">
              Get a Free Estimate
            </Link>
            <a href="tel:4704030215" className="btn btn-outline-light">
              📞 Call (470) 403-0215
            </a>
          </div>
          <div className="trust-row">
            <div className="trust-row__item">
              <span className="stars">★★★★★</span> 4.8 / 5 · 34 Google Reviews
            </div>
            <div className="trust-row__item">✔ Licensed &amp; Insured</div>
            <div className="trust-row__item">✔ BBB A+ Accredited</div>
            <div className="trust-row__item">✔ 24/7 Emergency Response</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What We Do</span>
            <h2>Expert Tree Services Near You</h2>
            <p>See how it works in Canton, GA, one of the North Metro Atlanta communities we serve.</p>
          </div>
          <div className="grid grid--3">
            {SERVICES.map((service) => (
              <div className="card" key={service.slug}>
                <div className="card__body">
                  <h3>{service.name}</h3>
                  <p>{service.shortDescription}</p>
                  <Link
                    className="card__link"
                    href={`/${serviceCitySlug(service, canton)}`}
                  >
                    See it in Canton, GA →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Proudly Serving North Metro Atlanta</span>
            <h2>Find Your City</h2>
            <p>Click a city to see services and pricing near you.</p>
          </div>
          <div className="area-grid">
            {CITIES.slice(0, 8).map((city) =>
              city.isBuilt ? (
                <Link key={city.slug} className="area-chip" href={`/tree-service-${city.slug}-ga`}>
                  {city.name} <span className="arrow">→</span>
                </Link>
              ) : (
                <span key={city.slug} className="area-chip area-chip--muted">
                  {city.name}
                </span>
              )
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/service-areas" className="btn btn-green">
              See All 27 Service Areas
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--green" id="estimate">
        <div className="container split">
          <div>
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free Estimate</h2>
            <p>
              Tell us about the job and we&apos;ll get back to you fast with
              a fair, no-obligation quote.
            </p>
            <MapEmbed />
          </div>
          <EstimateForm />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify the app builds and Home renders**

```bash
npm run build && npm run start &
sleep 3 && curl -s http://localhost:3000 | grep -o "North Georgia" && kill %1
```
Expected: prints "North Georgia".

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Add data-driven Home page"
```

---

### Task 11: Service Area index page

**Files:**
- Create: `app/service-areas/page.tsx`

**Interfaces:**
- Consumes: `CITIES` from `lib/cities.ts`, `citySlug` from `lib/slugs.ts`
- Produces: `/service-areas`, linked from Task 7 (footer/header) and Task 10 (Home)

- [ ] **Step 1: Write the page**

```tsx
// app/service-areas/page.tsx
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { citySlug } from "@/lib/slugs";

export const metadata = {
  title: "Tree Service Areas | MMP Tree Service LLC",
  description:
    "MMP Tree Service proudly serves 27 North Metro Atlanta communities. Find tree removal, trimming, and stump grinding near you.",
};

export default function ServiceAreasPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Where We Work</span>
          <h1>Our Service Areas</h1>
          <p>
            Click a city to see tree removal, trimming, stump grinding, lot
            clearing, and emergency tree service near you.
          </p>
        </div>
        <div className="area-grid">
          {CITIES.map((city) =>
            city.isBuilt ? (
              <Link key={city.slug} className="area-chip" href={`/${citySlug(city)}`}>
                {city.name} <span className="arrow">→</span>
              </Link>
            ) : (
              <span key={city.slug} className="area-chip area-chip--muted">
                {city.name}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds; `/service-areas` listed in the route output.

- [ ] **Step 3: Commit**

```bash
git add app/service-areas/page.tsx
git commit -m "Add Service Area index page"
```

---

### Task 12: Canton content data

**Files:**
- Create: `content/canton.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `CANTON_CONTENT` object — consumed by Task 13 (`CityHubTemplate`) and Task 14 (`ServiceCityTemplate`)

Note: this task is content authoring, not link-building. Per the spec's
content-approach section, external citation links and government-URL
verification are a content-ops follow-up outside this coding plan —
this task writes real, locally-accurate copy (Cherokee County, GA
geography and conditions) without fabricating specific external URLs.

- [ ] **Step 1: Write the content data file**

```ts
// content/canton.ts
export type ServicePageContent = {
  intro: string;
  howItWorks: { title: string; body: string };
  cost: { title: string; body: string };
  localConsiderations: { title: string; body: string };
  faqs: { question: string; answer: string }[];
};

export const CANTON_CONTENT: {
  hub: { intro: string; whyUs: string[] };
  services: Record<string, ServicePageContent>;
} = {
  hub: {
    intro:
      "Canton, GA sits at the heart of Cherokee County, where new subdivisions push up against mature stands of pine and hardwood along the Etowah River. That mix — established tree canopy next to fresh construction — is exactly what keeps our crews busy here: storm-damaged hardwoods near Boling Park, pines thinned for new lots off Riverstone Parkway, and the clay-heavy Piedmont soil that makes stump removal tougher than it looks.",
    whyUs: [
      "Local knowledge of Cherokee County's clay soil and root systems",
      "Experience with Canton's mix of mature hardwoods and new-construction pines",
      "Fast response for storm damage along the Etowah River corridor",
      "Licensed, insured, and ISA-certified arborists on every crew",
    ],
  },
  services: {
    "tree-removal": {
      intro:
        "Canton's older neighborhoods near downtown carry decades-old oaks and hickories, many planted well before today's setback rules — which means removal often has to thread between a house, a driveway, and a neighbor's fence line. We plan every Canton removal around what's actually on the lot, not a generic checklist.",
      howItWorks: {
        title: "How Tree Removal Works in Canton",
        body:
          "We start with an on-site assessment of the tree's lean, root condition, and surrounding structures — critical in Canton's tighter, older lots. For larger hardwoods, we section the tree down piece by piece using rigging rather than a single fell, protecting driveways, fences, and neighboring yards. Cherokee County's clay soil holds moisture longer after rain, which affects root stability and crew scheduling around wet ground.",
      },
      cost: {
        title: "What Tree Removal Costs in Canton",
        body:
          "Most single-tree removals in Canton run from a few hundred dollars for a small, easily accessed tree to several thousand for a large hardwood near a structure requiring rigging and crane support. The biggest cost factors here are proximity to the house, whether power lines cross the removal path, and stump handling.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Cherokee County's red clay compacts hard when dry and turns slick when wet, which affects both equipment access and how we protect your lawn during the job. Many Canton properties near the Etowah River floodplain also have root systems weakened by periodic flooding — we check for this during assessment, since it changes how a tree needs to come down.",
      },
      faqs: [
        {
          question: "Do I need a permit to remove a tree in Canton, GA?",
          answer:
            "It depends on the tree's size, species, and whether the property is inside city limits versus unincorporated Cherokee County — rules differ between the two. We'll flag if your specific removal likely needs a permit during the estimate.",
        },
        {
          question: "How quickly can you remove a storm-damaged tree in Canton?",
          answer:
            "For active hazards — a leaning or split tree threatening a house or driveway — we prioritize same-day or next-day response. Call our 24/7 line for anything urgent.",
        },
        {
          question: "Will you remove the stump too?",
          answer:
            "Stump grinding is a separate service — see our Canton stump grinding page — but we're happy to quote both together in one visit.",
        },
        {
          question: "What happens to the wood after removal?",
          answer:
            "By default we haul and dispose of all debris. If you'd like to keep firewood-length rounds, let us know before the job and we'll leave what you want.",
        },
        {
          question: "Do you work near power lines in Canton?",
          answer:
            "Yes, but for lines directly in the drop zone we coordinate timing carefully and, when required, loop in the utility company before cutting.",
        },
      ],
    },
    "tree-trimming": {
      intro:
        "Between the shade canopy in Canton's established neighborhoods and the young, fast-growing pines on newer lots, trimming needs here vary a lot by street. We prune for structure and long-term health, not just a quick haircut.",
      howItWorks: {
        title: "How Tree Trimming Works in Canton",
        body:
          "Our ISA-certified arborists assess each tree's branching structure before making a cut, removing dead or crossing limbs first, then thinning for airflow and light. For Canton's younger pine stands on newer lots, we focus on early structural pruning that prevents costly problems as the trees mature.",
      },
      cost: {
        title: "What Tree Trimming Costs in Canton",
        body:
          "Routine trimming for a mid-size shade tree typically runs less than removal, scaling up with tree height, number of trees, and access difficulty. Multi-tree jobs on larger Canton lots often get a better per-tree rate.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Pine stands common on Canton's newer development lots are prone to storm breakage if not thinned properly — we watch for this on every trim. In older neighborhoods, we're careful trimming near century-old oaks whose root systems can be sensitive to heavy equipment traffic.",
      },
      faqs: [
        {
          question: "When is the best time of year to trim trees in Canton?",
          answer:
            "Late winter, while trees are dormant, is ideal for most structural pruning — though dead or hazardous limbs should be removed any time of year.",
        },
        {
          question: "Can trimming help my trees survive Georgia storms better?",
          answer:
            "Yes — thinning dense canopy reduces wind resistance, which is one of the most effective ways to reduce storm damage risk on established trees.",
        },
        {
          question: "Do you trim trees near power lines?",
          answer:
            "We handle line-adjacent trimming carefully and coordinate with the utility company when clearance work near primary lines is required.",
        },
        {
          question: "How often should trees be trimmed?",
          answer:
            "Most mature shade trees benefit from trimming every 2-3 years; younger or fast-growing pines may need more frequent structural attention.",
        },
        {
          question: "Will trimming hurt my tree?",
          answer:
            "Proper pruning by a certified arborist improves tree health. Improper cuts — especially topping — can permanently weaken a tree, which is why we avoid that practice entirely.",
        },
      ],
    },
    "stump-grinding": {
      intro:
        "Cherokee County's dense clay soil makes stump removal harder than it looks from the surface — roots anchor deep and wide, and clay resists the kind of clean extraction easier sandy soils allow. Grinding below grade is usually the faster, less disruptive path for Canton yards.",
      howItWorks: {
        title: "How Stump Grinding Works in Canton",
        body:
          "We grind the stump and surface roots below grade using a mechanical grinder, leaving a bed of wood chips you can backfill with soil. For Canton's clay-heavy lots, we often need extra passes since compacted clay holds the stump and root ball more firmly than looser soil types.",
      },
      cost: {
        title: "What Stump Grinding Costs in Canton",
        body:
          "Pricing scales with stump diameter and root spread — small stumps are quick, while large hardwood stumps with wide surface roots take longer to grind fully below grade. Grinding multiple stumps in one visit typically costs less per stump than separate trips.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Because Cherokee County clay compacts and holds moisture, freshly ground stump areas may settle over the following months as the clay dries and shifts — we let customers know to expect some settling before final landscaping.",
      },
      faqs: [
        {
          question: "How deep do you grind the stump?",
          answer:
            "Typically 4-6 inches below grade, enough to plant grass or light landscaping over the spot without hitting wood.",
        },
        {
          question: "Can I plant a new tree in the same spot?",
          answer:
            "Usually yes, though we recommend waiting for the ground to settle and, for the same species, choosing a slightly offset spot to avoid old root competition.",
        },
        {
          question: "What do you do with the wood chips?",
          answer:
            "We can leave them on-site for mulch or haul them away — your choice, no extra charge either way for standard jobs.",
        },
        {
          question: "Is stump grinding better than full stump removal?",
          answer:
            "For most residential yards, yes — grinding is faster, less disruptive to surrounding soil, and costs less. Full removal is only needed when every root must come out, such as before building on that exact spot.",
        },
        {
          question: "Will grinding damage my irrigation or utility lines?",
          answer:
            "We ask about buried lines before starting and grind conservatively near any marked utilities.",
        },
      ],
    },
    "lot-clearing": {
      intro:
        "With new subdivisions continuing to fill in around Canton and along the Riverstone Parkway corridor, lot clearing is one of our most requested services from builders and homeowners preparing raw land for construction.",
      howItWorks: {
        title: "How Lot Clearing Works in Canton",
        body:
          "We assess the full lot for tree density, species mix, and terrain before clearing, removing trees, brush, and stumps in a sequence that keeps the site accessible for equipment throughout the job. Cherokee County's rolling terrain often means grading considerations factor into how we stage debris removal.",
      },
      cost: {
        title: "What Lot Clearing Costs in Canton",
        body:
          "Cost depends heavily on lot size, tree density, and whether stumps need full removal or grinding. Wooded residential lots typically cost less to clear than heavily forested acreage requiring extensive debris hauling.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Cherokee County has tree ordinance and buffer requirements in some zoning districts, particularly near the Etowah River corridor — we flag likely buffer-zone restrictions during the site walk so clearing plans stay compliant.",
      },
      faqs: [
        {
          question: "Do I need a permit to clear a lot in Canton?",
          answer:
            "Larger clearing projects, especially for new construction, typically require permits through Cherokee County or the City of Canton depending on location — we help identify what applies to your specific lot.",
        },
        {
          question: "Can you clear a lot that's still partially wooded but keep some trees?",
          answer:
            "Yes — selective clearing to preserve specific trees or a tree line is common and something we plan for during the walk-through.",
        },
        {
          question: "How long does lot clearing take?",
          answer:
            "A typical residential lot takes a few days; larger or heavily wooded acreage can take longer depending on density and access.",
        },
        {
          question: "What happens to the cleared debris?",
          answer:
            "We hall debris off-site by default, though some clients choose to have wood chipped and left on-site for erosion control during construction.",
        },
        {
          question: "Do you work with builders directly?",
          answer:
            "Yes, we regularly coordinate directly with builders and contractors on new-construction timelines in the Canton area.",
        },
      ],
    },
    "emergency-tree-service": {
      intro:
        "Georgia's pop-up thunderstorms and occasional ice events hit Cherokee County hard, and Canton's mix of mature hardwoods and newer pine stands means storm damage can strike either an old oak limb or a stressed young pine. We run 24/7 emergency response specifically for this.",
      howItWorks: {
        title: "How Emergency Tree Service Works in Canton",
        body:
          "When you call our 24/7 line, we prioritize active hazards — trees on structures, blocking driveways, or leaning dangerously — for same-day response where possible. Our crews stabilize or remove the immediate hazard first, then handle full cleanup and, if needed, document damage for your insurance claim.",
      },
      cost: {
        title: "What Emergency Tree Service Costs in Canton",
        body:
          "Emergency pricing depends on severity, time of day, and access — a tree resting on a roof after hours costs more to address urgently than daytime cleanup of a fallen limb. We provide a clear quote before starting work whenever the situation allows.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Canton sees both summer microburst thunderstorms and occasional winter ice storms, each stressing trees differently — ice loads snap brittle limbs, while high wind uproots trees weakened by Cherokee County's saturated clay soil after heavy rain.",
      },
      faqs: [
        {
          question: "Are you available 24/7 for emergencies in Canton?",
          answer:
            "Yes — call (470) 403-0215 any time, day or night, for active storm damage or a hazardous tree.",
        },
        {
          question: "Do you work with homeowners insurance?",
          answer:
            "Yes, we document damage clearly and work directly with insurance companies to help streamline claims.",
        },
        {
          question: "What should I do while waiting for your crew to arrive?",
          answer:
            "Stay away from the damaged tree and any downed power lines, and avoid entering rooms directly under a tree resting on your roof until we've assessed stability.",
        },
        {
          question: "Can you remove a tree that's already fallen on my house?",
          answer:
            "Yes — this is one of our most common emergency calls. We remove the tree carefully to avoid further structural damage and can coordinate with your insurance adjuster.",
        },
        {
          question: "How fast can you respond after a storm?",
          answer:
            "For active hazards we prioritize same-day response whenever conditions allow safe access; response time may extend slightly during major, area-wide storm events.",
        },
      ],
    },
  },
};
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add content/canton.ts
git commit -m "Add Canton hub and service-page content"
```

---

### Task 13: `CityHubTemplate` component

**Files:**
- Create: `components/CityHubTemplate.tsx`

**Interfaces:**
- Consumes: `City` type from `lib/cities.ts`, `SERVICES` from `lib/services.ts`, `serviceCitySlug` from `lib/slugs.ts`, `<MapEmbed />`/`<EstimateForm />` from Task 6, hub content shape from Task 12 (`{ intro: string; whyUs: string[] }`)
- Produces: `<CityHubTemplate city={City} content={{ intro, whyUs }} />` — consumed by Task 15 (`[slug]/page.tsx`)

- [ ] **Step 1: Write the component**

```tsx
// components/CityHubTemplate.tsx
import Link from "next/link";
import type { City } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { serviceCitySlug } from "@/lib/slugs";
import { MapEmbed } from "./MapEmbed";
import { EstimateForm } from "./EstimateForm";

export function CityHubTemplate({
  city,
  content,
}: {
  city: City;
  content: { intro: string; whyUs: string[] };
}) {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="container hero__content">
          <p className="hero__breadcrumb">
            <Link href="/">Home</Link> / Tree Service in {city.name}
          </p>
          <h1>Tree Service in {city.name}</h1>
          <p className="lead">{content.intro}</p>
          <div className="hero__actions">
            <Link href="/contact" className="btn btn-orange">
              Get a Free Estimate
            </Link>
            <a href="tel:4704030215" className="btn btn-outline-light">
              📞 Call (470) 403-0215
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our Services in {city.name}</span>
            <h2>Every Service, One Trusted Crew</h2>
          </div>
          <div className="grid grid--3">
            {SERVICES.map((service) => (
              <div className="card" key={service.slug}>
                <div className="card__body">
                  <h3>{service.name}</h3>
                  <p>{service.shortDescription}</p>
                  <Link
                    className="card__link"
                    href={`/${serviceCitySlug(service, city)}`}
                  >
                    {service.name} in {city.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why {city.name} Chooses MMP</span>
            <h2>Local Crews Who Know {city.name}</h2>
          </div>
          <ul className="check-list">
            {content.whyUs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--green" id="estimate">
        <div className="container split">
          <div>
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free Estimate in {city.name}</h2>
            <MapEmbed />
          </div>
          <EstimateForm />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/CityHubTemplate.tsx
git commit -m "Add CityHubTemplate component"
```

---

### Task 14: `ServiceCityTemplate` component

**Files:**
- Create: `components/ServiceCityTemplate.tsx`

**Interfaces:**
- Consumes: `City` from `lib/cities.ts`, `Service` from `lib/services.ts`, `citySlug` from `lib/slugs.ts`, `<MapEmbed />`/`<EstimateForm />` from Task 6, `ServicePageContent` type from Task 12
- Produces: `<ServiceCityTemplate city={City} service={Service} content={ServicePageContent} />` — consumed by Task 15

- [ ] **Step 1: Write the component**

```tsx
// components/ServiceCityTemplate.tsx
import Link from "next/link";
import type { City } from "@/lib/cities";
import type { Service } from "@/lib/services";
import { citySlug } from "@/lib/slugs";
import type { ServicePageContent } from "@/content/canton";
import { MapEmbed } from "./MapEmbed";
import { EstimateForm } from "./EstimateForm";

export function ServiceCityTemplate({
  city,
  service,
  content,
}: {
  city: City;
  service: Service;
  content: ServicePageContent;
}) {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1800&q=80')",
        }}
      >
        <div className="container hero__content">
          <p className="hero__breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href={`/${citySlug(city)}`}>{city.name}</Link> / {service.name}
          </p>
          <h1>{service.name} in {city.name}</h1>
          <p className="lead">{content.intro}</p>
          <div className="hero__actions">
            <Link href="/contact" className="btn btn-orange">
              Get a Free Estimate
            </Link>
            <a href="tel:4704030215" className="btn btn-outline-light">
              📞 Call (470) 403-0215
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <h2>{content.howItWorks.title}</h2>
            <p>{content.howItWorks.body}</p>
            <h2>{content.cost.title}</h2>
            <p>{content.cost.body}</p>
            <h2>{content.localConsiderations.title}</h2>
            <p>{content.localConsiderations.body}</p>
          </div>
          <MapEmbed />
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQs</span>
            <h2>{service.name} in {city.name}: Common Questions</h2>
          </div>
          {content.faqs.map((faq) => (
            <div className="faq-item" key={faq.question}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--green" id="estimate">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Get Started</span>
            <h2>Request Your Free Estimate</h2>
          </div>
          <EstimateForm />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/ServiceCityTemplate.tsx
git commit -m "Add ServiceCityTemplate component"
```

---

### Task 15: Dynamic `[slug]` route

**Files:**
- Create: `app/[slug]/page.tsx`

**Interfaces:**
- Consumes: `resolveSlug`/`builtSlugs` from `lib/slugs.ts`, `CANTON_CONTENT` from `content/canton.ts`, `<CityHubTemplate />` (Task 13), `<ServiceCityTemplate />` (Task 14)
- Produces: every Canton route (`/tree-service-canton-ga`, `/tree-removal-canton-ga`, etc.)

- [ ] **Step 1: Write the route**

```tsx
// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { resolveSlug, builtSlugs } from "@/lib/slugs";
import { CANTON_CONTENT } from "@/content/canton";
import { CityHubTemplate } from "@/components/CityHubTemplate";
import { ServiceCityTemplate } from "@/components/ServiceCityTemplate";

export function generateStaticParams() {
  return builtSlugs().map((slug) => ({ slug }));
}

export default async function CityOrServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolved = resolveSlug(slug);

  if (!resolved) {
    notFound();
  }

  if (resolved.type === "hub") {
    return <CityHubTemplate city={resolved.city} content={CANTON_CONTENT.hub} />;
  }

  return (
    <ServiceCityTemplate
      city={resolved.city}
      service={resolved.service}
      content={CANTON_CONTENT.services[resolved.service.slug]}
    />
  );
}
```

- [ ] **Step 2: Verify all 6 Canton routes build**

```bash
npm run build
```
Expected: build output lists `/tree-service-canton-ga`, `/tree-removal-canton-ga`, `/tree-trimming-canton-ga`, `/stump-grinding-canton-ga`, `/lot-clearing-canton-ga`, `/emergency-tree-service-canton-ga` as static routes.

- [ ] **Step 3: Commit**

```bash
git add app/[slug]/page.tsx
git commit -m "Add dynamic slug route resolving city hub and service+city pages"
```

---

### Task 16: About, Testimonials, Contact pages

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/testimonials/page.tsx`
- Create: `app/contact/page.tsx`

**Interfaces:**
- Consumes: `<MapEmbed />`/`<EstimateForm />` from Task 6
- Produces: `/about`, `/testimonials`, `/contact` — linked from Task 7 (nav)

- [ ] **Step 1: Write `/about`**

```tsx
// app/about/page.tsx
export const metadata = {
  title: "About MMP Tree Service LLC | North Metro Atlanta",
  description:
    "Family-owned, ISA-certified, licensed and insured — MMP Tree Service has served North Metro Atlanta for over a decade.",
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">About Us</span>
          <h1>12+ Years of Careful, Local Tree Care</h1>
          <p>
            As a local, family-owned company, we take pride in personalized
            service and long-lasting relationships with our clients — not a
            national call-center franchise. Every job is priced fairly,
            explained clearly, and cleaned up completely before we leave.
          </p>
        </div>
        <ul className="check-list">
          <li>ISA Certified Arborists on every crew</li>
          <li>Licensed, insured, and BBB A+ accredited</li>
          <li>State-of-the-art equipment for jobs of any size</li>
          <li>24/7 emergency response, insurance-claim support</li>
          <li>Full clean-up — we leave your property better than we found it</li>
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `/testimonials`**

```tsx
// app/testimonials/page.tsx
export const metadata = {
  title: "Testimonials | MMP Tree Service LLC",
  description: "4.8 out of 5 stars across 34 Google reviews — see what MMP Tree Service customers say.",
};

const REVIEWS = [
  {
    who: "Michael Todd",
    text: "This family-owned and operated company did an excellent job — they safely took down several trees and handled everything with care and professionalism.",
  },
  {
    who: "Michael Whitworth",
    text: "Excellent experience from start to finish — professional, efficient, and clearly skilled. They removed several large trees quickly and safely, and left the yard spotless.",
  },
  {
    who: "Moses Mo",
    text: "Family owned, hard working, excellent clean up, on time, quick, fair pricing, works with client's budget, very satisfied with services!",
  },
];

export default function TestimonialsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Testimonials</span>
          <h1>What Our Customers Say</h1>
          <p>4.8 out of 5 — 34 Google Reviews</p>
        </div>
        <div className="grid grid--3">
          {REVIEWS.map((review) => (
            <div className="testi-card" key={review.who}>
              <span className="stars">★★★★★</span>
              <p>&quot;{review.text}&quot;</p>
              <div className="who">{review.who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Write `/contact`**

```tsx
// app/contact/page.tsx
import { MapEmbed } from "@/components/MapEmbed";
import { EstimateForm } from "@/components/EstimateForm";

export const metadata = {
  title: "Contact MMP Tree Service LLC | Free Estimate",
  description: "Call (470) 403-0215 or request a free estimate online — available 24/7 for emergencies.",
};

export default function ContactPage() {
  return (
    <section className="section section--green" id="estimate">
      <div className="container split">
        <div>
          <span className="eyebrow">Get In Touch</span>
          <h1>Request Your Free Estimate</h1>
          <p>
            Call <a href="tel:4704030215">(470) 403-0215</a> or fill out the
            form — we&apos;re available 24/7 for emergencies.
          </p>
          <MapEmbed />
        </div>
        <EstimateForm />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds; `/about`, `/testimonials`, `/contact` listed as routes.

- [ ] **Step 5: Commit**

```bash
git add app/about/page.tsx app/testimonials/page.tsx app/contact/page.tsx
git commit -m "Add About, Testimonials, and Contact pages"
```

---

### Task 17: Our Work and Blog placeholder pages

**Files:**
- Create: `app/our-work/page.tsx`
- Create: `app/blog/page.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `/our-work`, `/blog` — linked from Task 7 (nav); real content is a later sub-project per the spec's Deferred section

- [ ] **Step 1: Write both placeholders**

```tsx
// app/our-work/page.tsx
export const metadata = { title: "Our Work | MMP Tree Service LLC" };

export default function OurWorkPage() {
  return (
    <section className="section">
      <div className="container section-head">
        <span className="eyebrow">Our Work</span>
        <h1>Coming Soon</h1>
        <p>
          We&apos;re building out a full gallery of recent MMP Tree Service
          jobs. In the meantime, call{" "}
          <a href="tel:4704030215">(470) 403-0215</a> to see examples near
          you.
        </p>
      </div>
    </section>
  );
}
```

```tsx
// app/blog/page.tsx
export const metadata = { title: "Blog | MMP Tree Service LLC" };

export default function BlogPage() {
  return (
    <section className="section">
      <div className="container section-head">
        <span className="eyebrow">Blog</span>
        <h1>Coming Soon</h1>
        <p>
          Tree care tips for North Metro Atlanta homeowners — launching
          soon.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the app builds**

```bash
npm run build
```
Expected: build succeeds; `/our-work`, `/blog` listed as routes.

- [ ] **Step 3: Commit**

```bash
git add app/our-work/page.tsx app/blog/page.tsx
git commit -m "Add Our Work and Blog placeholder pages"
```

---

### Task 18: End-to-end smoke test across the whole site

**Files:**
- Create: `e2e/nav-and-pages.spec.ts`

**Interfaces:**
- Consumes: the running built app (all previous tasks)
- Produces: CI-runnable proof the whole foundation works together

- [ ] **Step 1: Write the e2e spec**

```ts
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
    await expect(page.locator(`a[href="/${slug}"]`).first()).toBeVisible();
  }
});

test("a Canton service page renders FAQs and the map embed", async ({ page }) => {
  await page.goto("/tree-removal-canton-ga");
  await expect(page.getByRole("heading", { name: /tree removal in canton/i })).toBeVisible();
  await expect(page.locator(".faq-item").first()).toBeVisible();
  await expect(page.locator(".map-embed iframe")).toBeVisible();
});

test("service area index lists 27 cities, only Canton linked", async ({ page }) => {
  await page.goto("/service-areas");
  await expect(page.locator(".area-chip")).toHaveCount(27);
  await expect(page.locator("a.area-chip")).toHaveCount(1);
});

test("nav mega-menu reaches a Canton service page", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Service Area", { exact: true }).hover();
  await page.getByRole("link", { name: /canton, ga/i }).hover();
  await page.getByRole("link", { name: /tree trimming/i }).first().click();
  await expect(page).toHaveURL(/tree-trimming-canton-ga/);
});

test("about, testimonials, contact, our-work, and blog all load", async ({ page }) => {
  for (const path of ["/about", "/testimonials", "/contact", "/our-work", "/blog"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
  }
});
```

- [ ] **Step 2: Run the full e2e suite**

```bash
npm run e2e
```
Expected: all 6 tests PASS.

- [ ] **Step 3: Run the unit suite one more time to confirm nothing regressed**

```bash
npm test
```
Expected: all unit tests (services, cities, slugs, SiteHeader) PASS.

- [ ] **Step 4: Commit**

```bash
git add e2e/nav-and-pages.spec.ts
git commit -m "Add end-to-end smoke tests across the full foundation"
```

---

## Post-plan note

Once this plan is executed, retire the static prototype:

```bash
git -C /Users/ericmichiels/Claude/Sites/mmp-tree-service rm -r redesign 2>/dev/null || rm -rf /Users/ericmichiels/Claude/Sites/mmp-tree-service/redesign
```

(Only after confirming the new Next.js site is running and approved —
don't delete the prototype pre-emptively.)
