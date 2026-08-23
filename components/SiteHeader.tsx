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
