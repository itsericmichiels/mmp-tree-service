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
    // "Tree Removal" and "Emergency Tree Service" each appear twice by
    // design: once in the top-level Services dropdown (which points at
    // Canton by default) and once in the Service Area > Canton flyout.
    // Both instances must point at the same, correct URL.
    const removalLinks = screen.getAllByRole("link", { name: /tree removal/i });
    expect(removalLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of removalLinks) {
      expect(link).toHaveAttribute("href", "/tree-removal-canton-ga");
    }
    const emergencyLinks = screen.getAllByRole("link", {
      name: /emergency tree service/i,
    });
    expect(emergencyLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of emergencyLinks) {
      expect(link).toHaveAttribute("href", "/emergency-tree-service-canton-ga");
    }
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
