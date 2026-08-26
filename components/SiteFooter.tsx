// components/SiteFooter.tsx
import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { CITIES } from "@/lib/cities";
import { serviceCitySlug } from "@/lib/slugs";

export function SiteFooter() {
  const canton = CITIES.find((c) => c.slug === "canton")!;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <img src="/mmp-logo.png" alt="MMP Tree Service logo" />
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
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={
                      service.hasGeneralPage
                        ? `/${service.slug}`
                        : `/${serviceCitySlug(service, canton)}`
                    }
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
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
