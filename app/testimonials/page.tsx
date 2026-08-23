export const metadata = {
  title: "Testimonials | MMP Tree Service LLC",
  description: "4.8 out of 5 stars across 34 Google reviews — see what MMP Tree Service customers say.",
};

const REVIEWS = [
  {
    who: "Michael Todd",
    text: "This family-owned and operated company did an excellent job — they safely took down several trees and handled everything with care and professionalism.",
  },
  {
    who: "Michael Whitworth",
    text: "Excellent experience from start to finish — professional, efficient, and clearly skilled. They removed several large trees quickly and safely, and left the yard spotless.",
  },
  {
    who: "Moses Mo",
    text: "Family owned, hard working, excellent clean up, on time, quick, fair pricing, works with client's budget, very satisfied with services!",
  },
];

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
