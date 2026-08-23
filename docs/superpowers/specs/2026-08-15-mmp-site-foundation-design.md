# MMP Tree Service — Site Foundation Design

Status: Approved for implementation planning
Date: 2026-08-15
Sub-project: 1 of 5 (foundation) — see "Deferred" section for the rest

## Context

MMP Tree Service (mmptreeservice.com) is a live WordPress site with an
existing weekly SEO content pipeline (see
`../../../content-pipeline/SKILL.md`): 2 hand-researched city/service pages
per week, following a strict rule of unique, locally-researched copy per
page (no templated/duplicate-feeling content — this is a deliberate
anti-doorway-page discipline, not an oversight).

Goal: replace the eventual site (not WordPress itself, yet — this phase is
design-approval only) with a Next.js app that:
- Looks and navigates like a fully mature multi-city tree service site
  from day one (full mega-menu, all cities present)
- Generates pages from a small data config rather than hand-authored HTML,
  so it can scale to ~27 cities × 5 services (~160 pages) without
  hand-building each one
- Preserves the existing pipeline's SEO discipline: pages only go live
  (and only appear in navigation) once they have real, unique content
- Can later be forked as a template for other service-provider clients
  (e.g. Quality Tree Service DFW)

This spec covers **only the foundation**: tech setup, data model,
navigation, shared layout/components, and the first fully-built page set
(Canton, all 5 services). Blog, image admin, full city rollout, and
templating are separate, later sub-projects (see Deferred).

## Decisions

### Tech stack
Next.js (App Router) + TypeScript, statically generated
(`generateStaticParams`) for SEO and speed. Lives at
`Sites/mmp-tree-service/site/` as its own git repo, separate from the
retired static-HTML prototype in `Sites/mmp-tree-service/redesign/`.
Previewed locally via `npm run dev` (same pattern as the `fusades`
project's dev server).

### URL / slug strategy
Flat slugs, matching the existing WordPress pipeline's convention exactly:
- City hub: `/tree-service-[city]-ga`
- Service + city: `/[service]-[city]-ga` (e.g. `/tree-removal-canton-ga`)

Not nested (`/canton/tree-removal`). Reason: if this site eventually
replaces the WordPress site on the live domain, URLs are identical to
what's already indexed — no redirect chain, no ranking loss. (The
migration/hosting decision itself is out of scope for this spec.)

### Data model
Two config files drive every generated page and the navigation:

```ts
// data/cities.ts
type City = {
  slug: string;        // "canton"
  name: string;        // "Canton, GA"
  isBuilt: boolean;     // true = has real content, appears in nav + generates pages
};

// data/services.ts
type Service = {
  slug: string;         // "tree-removal"
  name: string;         // "Tree Removal"
  shortDescription: string;
  icon: string;         // icon key for card/nav use
};
```

The 5 services (fixed set for this phase): Tree Removal, Tree Trimming,
Stump Grinding, Lot Clearing, Emergency Tree Service.

All 27 cities from the live site's service-area list are entered into
`cities.ts` now, with `isBuilt: false` except Canton (`isBuilt: true`).
Page routes and nav entries are generated only for
`city.isBuilt && service is one of that city's built services` — for this
phase, "built services" for a city is simply: all 5, if `isBuilt`, else
none. (A per-service-per-city flag can be added later once cities are
built one service at a time, rather than all 5 at once — not needed yet
since Canton launches with all 5 together.)

Un-built combinations are simply never linked or routed — nothing 404s
from the menu, because the menu only ever renders what exists.

### Navigation (mega-menu)
Shared header in the root layout, data-driven off `cities.ts` /
`services.ts`:
- **Services** dropdown — flat list of all 5 services; each links to
  that service's Canton page (the only built city today). This is a
  simple, correct default that costs nothing to change later — once a
  second city is built, this can become a proper services landing page
  if desired, but that's not needed for this phase.
- **Service Area** dropdown — every city in `cities.ts` is listed; each
  row that `isBuilt` shows a flyout submenu of its (currently: all 5)
  service pages, matching the Quality Tree Service DFW reference
  structure. Cities not yet built appear as plain, muted, non-clickable
  text (same treatment as the `area-chip--muted` style already used in
  the retired static prototype) — so the menu looks complete without
  implying a link that doesn't exist.
- **About**, **Our Work**, **Testimonials**, **Blog**, **Contact** —
  fixed top-level links
- Logo, phone number, orange "Get a Free Estimate" button — always
  visible, plus the sticky top bar and fixed bottom mobile CTA bar
  carried over from the retired static draft

### Shared components
- `<SiteHeader>` / `<SiteFooter>` — one definition, used via root layout
- `<MapEmbed>` — wraps the provided Google Maps iframe
  (`...!2sMMP%20Tree%20Service%20LLC...`), used on every city/service
  page and the homepage
- `<EstimateForm>` — wraps the provided GoHighLevel widget iframe
  (`link.contentcreatormachine.com/widget/form/...`); the
  `form_embed.js` script is loaded **once** via `next/script` in the
  root layout, not duplicated per page
- `<StickyCta>` — fixed bottom bar (Call / Get a Free Estimate), all
  pages

### Pages built in this phase
- `/` — Home (ports content from the retired static prototype's
  `index.html`, restyled to the new nav/design system)
- `/service-areas` — full list of all 27 cities; only Canton links out
  (matches current data state)
- `/tree-service-canton-ga` — Canton hub page, links to all 5 Canton
  service pages
- `/tree-removal-canton-ga`, `/tree-trimming-canton-ga`,
  `/stump-grinding-canton-ga`, `/lot-clearing-canton-ga`,
  `/emergency-tree-service-canton-ga` — full service+city template
  (process, cost, why-us, FAQs, map, cross-links), each with real,
  unique Canton-specific copy
- `/about`, `/testimonials`, `/contact` — simple real pages (now that
  they're in top-level nav)
- `/our-work`, `/blog` — lightweight "coming soon" placeholders

### Content approach
Canton's hub + 5 service pages get real, uniquely-researched copy now
(current landmarks, terrain, tree species, etc. — same bar as the
existing WordPress pipeline). The remaining 26 cities are added
incrementally after this phase, at a sustainable pace, following the
same per-page research discipline — explicitly **not** a bulk
find-and-replace of city names into a template, since that's the exact
pattern the existing pipeline's rules were written to avoid and risks
hurting SEO rather than helping it.

## Deferred (separate sub-projects, later)
1. Blog system build-out (MDX-file-based posts + an admin form that
   writes them — approved direction, not designed in this spec)
2. Image-management admin page (swap image URL per page/slot — approved
   direction, not designed in this spec)
3. Building out the remaining 26 cities × 5 services
4. Generalizing this codebase into a reusable multi-client template
5. WordPress migration / hosting / domain cutover
