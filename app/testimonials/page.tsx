import { REVIEWS } from "@/lib/testimonials";

export const metadata = {
  title: "Testimonials | MMP Tree Service LLC",
  description: "4.8 out of 5 stars across 34 Google reviews — see what MMP Tree Service customers say.",
};

export default function TestimonialsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Testimonials</span>
          <h1>What Our Customers Say</h1>
          <p>4.8 out of 5 — 34 Google Reviews</p>
        </div>
        <div className="grid grid--3">
          {REVIEWS.map((review) => (
            <div className="testi-card" key={review.who}>
              <span className="stars">★★★★★</span>
              <p>&quot;{review.text}&quot;</p>
              <div className="who">{review.who}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
