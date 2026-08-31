// lib/googleReviews.ts
// Live Google reviews for MMP Tree Service LLC, via the Places API (New).
// Falls back to the static REVIEWS list if the API key is missing, the
// request fails, or Google returns no reviews — the reviews sections must
// never break the page.
import { REVIEWS as FALLBACK_REVIEWS, type Review } from "@/lib/testimonials";

const PLACE_ID = "ChIJd0Cu-g6f9YgRmSDMc-HVSA0"; // MMP Tree Service LLC, Acworth GA

// The API key is restricted to specific HTTP referrers in Google Cloud
// Console; server-side fetches don't send a browser referrer, so we set
// one explicitly matching an allowed value.
const REFERER = "https://mmptreeservice.com/";

// Fallback link for reviews without their own googleMapsUri (the static
// fallback list) — opens the business's full review list on Google.
export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;

export type GoogleReviewsData = {
  rating: number;
  reviewCount: number;
  reviews: Review[];
};

const FALLBACK: GoogleReviewsData = {
  rating: 4.8,
  reviewCount: 34,
  reviews: FALLBACK_REVIEWS,
};

type PlacesApiReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
  googleMapsUri?: string;
};

type PlacesApiResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesApiReview[];
};

export async function getGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return FALLBACK;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        Referer: REFERER,
      },
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as PlacesApiResponse;
    if (!data.reviews?.length) return FALLBACK;

    const reviews: Review[] = data.reviews
      .map((r) => ({
        who: r.authorAttribution?.displayName ?? "Google User",
        text: r.text?.text ?? r.originalText?.text ?? "",
        rating: r.rating ?? 5,
        googleMapsUri: r.googleMapsUri,
      }))
      .filter((r) => r.text.length > 0);

    if (!reviews.length) return FALLBACK;

    return {
      rating: data.rating ?? FALLBACK.rating,
      reviewCount: data.userRatingCount ?? FALLBACK.reviewCount,
      reviews,
    };
  } catch {
    return FALLBACK;
  }
}
