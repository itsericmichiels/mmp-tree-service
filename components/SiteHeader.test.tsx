// components/SiteHeader.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders a link to Canton's hub page", () => {
    render(<SiteHeader />);
    const link = screen.getByRole("link", { name: /canton, ga/i });
    expect(link).toHaveAttribute("href", "/tree-service-canton-ga");
  });

  it("renders Canton's 5 services as flyout links", () => {
    render(<SiteHeader />);
    // The top-level "Services" dropdown always points at Canton by design
    // (it's not city-scoped), regardless of how many other cities are built.
    const servicesPanel = document.getElementById("nav-services-panel")!;
    expect(
      within(servicesPanel).getByRole("link", { name: /tree removal/i })
    ).toHaveAttribute("href", "/tree-removal-canton-ga");
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
      screen.queryByRole("link", { name: /^dunwoody, ga$/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/dunwoody, ga/i)).toBeInTheDocument();
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
