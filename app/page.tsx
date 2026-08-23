import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { citySlug, serviceCitySlug } from "@/lib/slugs";
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
