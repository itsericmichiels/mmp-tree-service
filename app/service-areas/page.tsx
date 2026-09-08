import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { citySlug } from "@/lib/slugs";

export const metadata = {
  title: "Tree Service Areas | MMP Tree Service LLC",
  description:
    "MMP Tree Service proudly serves 27 North Metro Atlanta communities. Find tree removal, trimming, and stump grinding near you.",
  alternates: { canonical: "/service-areas" },
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
