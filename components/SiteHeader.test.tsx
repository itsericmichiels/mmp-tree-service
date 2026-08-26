// components/SiteHeader.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

// All 27 real cities are now built out, so there's no longer a real
// currently-unbuilt city to use as a fixture. Mock the city list with a
// small fixture that keeps Canton and Marietta built (other tests below
// rely on their real content) and adds one deliberately-unbuilt fictional
// city, so the "unbuilt city renders as text, not a link" behavior stays
// testable independent of how many real cities are eventually built.
vi.mock("@/lib/cities", () => ({
  CITIES: [
    { slug: "canton", name: "Canton, GA", isBuilt: true },
    { slug: "marietta", name: "Marietta, GA", isBuilt: true },
    { slug: "hometown", name: "Hometown, GA", isBuilt: false },
  ],
}));

describe("SiteHeader", () => {
  it("renders a link to Canton's hub page", () => {
    render(<SiteHeader />);
    const link = screen.getByRole("link", { name: /canton, ga/i });
    expect(link).toHaveAttribute("href", "/tree-service-canton-ga");
  });

  it("renders Canton's 5 services as flyout links", () => {
    render(<SiteHeader />);
    // The top-level "Services" dropdown points at the general (non-city)
    // page for any service that has one (currently just Tree Removal), and
    // falls back to Canton for the rest until they get their own general
    // page too.
    const servicesPanel = document.getElementById("nav-services-panel")!;
    expect(
      within(servicesPanel).getByRole("link", { name: /tree removal/i })
    ).toHaveAttribute("href", "/tree-removal");
    expect(
      within(servicesPanel).getByRole("link", { name: /emergency tree service/i })
    ).toHaveAttribute("href", "/emergency-tree-service-canton-ga");

    // Canton's own flyout under Service Area > Canton must also point at
    // Canton's URLs — scoped to Canton's wrapper specifically, since other
    // built cities (Marietta, Woodstock, Alpharetta) render their own
    // "Tree Removal" flyout links pointing at their own URLs.
    const cantonLink = screen.getByRole("link", { name: /^canton, ga$/i });
    const cantonWrapper = cantonLink.closest(".dropdown__row-wrapper") as HTMLElement;
    expect(
      within(cantonWrapper).getByRole("link", { name: /tree removal/i })
    ).toHaveAttribute("href", "/tree-removal-canton-ga");
    expect(
      within(cantonWrapper).getByRole("link", { name: /emergency tree service/i })
    ).toHaveAttribute("href", "/emergency-tree-service-canton-ga");
  });

  it("renders the other built cities as their own flyout links, not Canton's", () => {
    render(<SiteHeader />);
    const mariettaLink = screen.getByRole("link", { name: /^marietta, ga$/i });
    const mariettaWrapper = mariettaLink.closest(".dropdown__row-wrapper") as HTMLElement;
    expect(
      within(mariettaWrapper).getByRole("link", { name: /tree removal/i })
    ).toHaveAttribute("href", "/tree-removal-marietta-ga");
  });

  it("renders un-built cities as non-clickable text, not links", () => {
    render(<SiteHeader />);
    expect(
      screen.queryByRole("link", { name: /^hometown, ga$/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/hometown, ga/i)).toBeInTheDocument();
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
