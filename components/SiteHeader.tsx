// components/SiteHeader.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { SERVICES } from "@/lib/services";
import { citySlug, serviceCitySlug } from "@/lib/slugs";

type DropdownName = "services" | "serviceArea";

export function SiteHeader() {
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close any open dropdown when clicking outside the nav, and close
  // everything on Escape. This keeps the click-driven menus from staying
  // stuck open once a user moves on.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleDropdown(name: DropdownName) {
    setOpenDropdown((current) => (current === name ? null : name));
  }

  // Close the mobile menu / any open dropdown whenever a link inside the
  // nav is actually followed, so the menu doesn't stay open after
  // navigating.
  function handleNavLinksClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.tagName === "A") {
      setMobileOpen(false);
      setOpenDropdown(null);
    }
  }

  const canton = CITIES.find((c) => c.slug === "canton")!;

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
        <nav className="nav container" ref={navRef}>
          <Link href="/" className="nav__brand">
            <img src="/mmp-logo.png" alt="MMP Tree Service LLC logo" />
            <span className="nav__brand-text">
              MMP Tree Service
              <small>Licensed &amp; Insured · North Georgia</small>
            </span>
          </Link>

          <button
            type="button"
            className="nav__menu-toggle"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="nav-links"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>

          <div
            id="nav-links"
            className={`nav__links${mobileOpen ? " is-open" : ""}`}
            onClick={handleNavLinksClick}
          >
            <div className="dropdown">
              <button
                type="button"
                className="dropdown__row dropdown__trigger"
                aria-haspopup="true"
                aria-expanded={openDropdown === "services"}
                aria-controls="nav-services-panel"
                onClick={() => toggleDropdown("services")}
              >
                Services
              </button>
              <div
                id="nav-services-panel"
                className={`dropdown__panel${openDropdown === "services" ? " is-open" : ""}`}
              >
                {SERVICES.map((service) => (
                  <Link
                    key={service.slug}
                    href={
                      service.hasGeneralPage
                        ? `/${service.slug}`
                        : `/${serviceCitySlug(service, canton)}`
                    }
                    className="dropdown__row"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="dropdown">
              <button
                type="button"
                className="dropdown__row dropdown__trigger"
                aria-haspopup="true"
                aria-expanded={openDropdown === "serviceArea"}
                aria-controls="nav-service-area-panel"
                onClick={() => toggleDropdown("serviceArea")}
              >
                Service Area
              </button>
              <div
                id="nav-service-area-panel"
                className={`dropdown__panel${openDropdown === "serviceArea" ? " is-open" : ""}`}
              >
                {CITIES.map((city) =>
                  city.isBuilt ? (
                    <div key={city.slug} className="dropdown__row-wrapper">
                      <Link href={`/${citySlug(city)}`} className="dropdown__row">
                        {city.name}
                      </Link>
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
                    </div>
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
            <span className="nav__phone">
              (470) 403-0215
              <small>Call for a free quote</small>
            </span>
            <Link href="/contact" className="btn btn-orange btn-sm">
              Get a Free Estimate
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
