import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { citySlug } from "@/lib/slugs";
import { SERVICES } from "@/lib/services";
import { MapEmbed } from "@/components/MapEmbed";
import { EstimateForm } from "@/components/EstimateForm";
import { getGoogleReviews, GOOGLE_REVIEWS_URL } from "@/lib/googleReviews";

// Real job photos where we have them, Unsplash stand-ins otherwise — same
// images used in the client-approved design prototype.
const SERVICE_IMAGES: Record<string, string> = {
  "tree-removal":
    "https://mmptreeservice.com/wp-content/uploads/2025/12/MMP-Tree-Service-LLC-tree-removal-scaled-375x525.jpg",
  "tree-trimming": "/images/services/tree-trimming.jpeg",
  "stump-grinding": "/images/services/stump-grinding.jpg",
  "lot-clearing":
    "https://images.unsplash.com/photo-1476231682828-37e571bc172f?auto=format&fit=crop&w=800&q=80",
  "emergency-tree-service":
    "https://mmptreeservice.com/wp-content/uploads/2026/01/Emergency-Tree-Service-MMP-Tree-Service-LLC-scaled-375x525.jpg",
};

export default async function HomePage() {
  const builtCities = CITIES.filter((c) => c.isBuilt);
  const { rating, reviewCount, reviews } = await getGoogleReviews();

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
              <span className="stars">★★★★★</span> {rating} / 5 · {reviewCount} Google Reviews
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
            <p>
              From routine trimming to emergency storm cleanup, our
              certified crews handle it all across North Metro Atlanta.
            </p>
          </div>
          <div className="grid grid--3">
            {SERVICES.map((service) => (
              <div className="card" key={service.slug}>
                <img
                  className="card__img"
                  src={SERVICE_IMAGES[service.slug]}
                  alt={service.name}
                />
                <div className="card__body">
                  <h3>{service.name}</h3>
                  <p>{service.shortDescription}</p>
                  <Link className="card__link" href={`/${service.slug}`}>
                    See Our Services →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container split">
          <div>
            <span className="eyebrow">Why Choose MMP</span>
            <h2>12+ Years of Careful, Local Tree Care</h2>
            <p>
              As a local, family-owned company, we take pride in
              personalized service and long-lasting relationships with our
              clients — not a national call-center franchise. Every job is
              priced fairly, explained clearly, and cleaned up completely
              before we leave.
            </p>
            <ul className="check-list">
              <li>ISA Certified Arborists on every crew</li>
              <li>Licensed, insured, and BBB A+ accredited</li>
              <li>State-of-the-art equipment for jobs of any size</li>
              <li>24/7 emergency response, insurance-claim support</li>
              <li>Full clean-up — we leave your property better than we found it</li>
            </ul>
            <div style={{ marginTop: 28 }}>
              <Link href="/contact" className="btn btn-green">
                Get a Free Estimate
              </Link>
            </div>
          </div>
          <div>
            <img
              src="https://mmptreeservice.com/wp-content/uploads/2026/01/MMP-Tree-Service-testimonials-768x1024.jpeg"
              alt="MMP Tree Service crew at work"
              width={768}
              height={1024}
              style={{ width: "100%", height: "auto", borderRadius: 14, boxShadow: "var(--shadow)" }}
            />
          </div>
        </div>
      </section>

      <section className="section credentials-band">
        <div className="container credentials-row">
          <div className="credentials-row__item">
            <span className="credentials-row__icon">📋</span>
            <span>Licensed</span>
          </div>
          <div className="credentials-row__item">
            <span className="credentials-row__icon">🛡️</span>
            <span>Insured</span>
          </div>
          <div className="credentials-row__item">
            <span className="credentials-row__icon">🌳</span>
            <span>ISA Certified Arborists</span>
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
          <ul className="city-list-columns">
            {builtCities.map((city) => (
              <li key={city.slug}>
                <Link href={`/${citySlug(city)}`}>{city.name}</Link>
              </li>
            ))}
          </ul>
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/service-areas" className="btn btn-green">
              See All 27 Service Areas
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Testimonials</span>
            <h2>What Our Customers Say</h2>
            <p>
              <span className="stars" style={{ color: "#FFB423" }}>
                ★★★★★
              </span>{" "}
              {rating} out of 5 — {reviewCount} Google Reviews
            </p>
          </div>
          <div className="grid grid--3">
            {reviews.map((review) => (
              <div className="testi-card" key={review.who}>
                <span className="stars">{"★".repeat(review.rating)}</span>
                <p>&quot;{review.text}&quot;</p>
                <div className="who">{review.who}</div>
                <a
                  className="testi-card__link"
                  href={review.googleMapsUri ?? GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read full review on Google →
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/testimonials">Read more reviews →</Link>
          </p>
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
