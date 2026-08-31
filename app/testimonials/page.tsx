import type { Metadata } from "next";
import { getGoogleReviews, GOOGLE_REVIEWS_URL } from "@/lib/googleReviews";

export async function generateMetadata(): Promise<Metadata> {
  const { rating, reviewCount } = await getGoogleReviews();
  return {
    title: "Testimonials | MMP Tree Service LLC",
    description: `${rating} out of 5 stars across ${reviewCount} Google reviews — see what MMP Tree Service customers say.`,
  };
}

export default async function TestimonialsPage() {
  const { rating, reviewCount, reviews } = await getGoogleReviews();

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Testimonials</span>
          <h1>What Our Customers Say</h1>
          <p>{rating} out of 5 — {reviewCount} Google Reviews</p>
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
      </div>
    </section>
  );
}
