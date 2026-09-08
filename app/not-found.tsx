import Link from "next/link";

export const metadata = {
  title: "Page Not Found | MMP Tree Service LLC",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h1>We Couldn&apos;t Find That Page</h1>
        <p style={{ maxWidth: 560, margin: "0 auto 28px" }}>
          The page you&apos;re looking for may have moved or no longer exists. Here are a few
          places to find what you need:
        </p>
        <div className="hero__actions" style={{ justifyContent: "center", marginBottom: 40 }}>
          <Link href="/" className="btn btn-green">
            Go to Homepage
          </Link>
          <Link href="/service-areas" className="btn btn-green">
            See Service Areas
          </Link>
          <Link href="/contact" className="btn btn-orange">
            Get a Free Estimate
          </Link>
        </div>
        <p className="form-note">
          Need help right now? Call <a href="tel:4704030215">(470) 403-0215</a> — available 24/7
          for emergencies.
        </p>
      </div>
    </section>
  );
}
