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
