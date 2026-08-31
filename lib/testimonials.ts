// lib/testimonials.ts
// Real Google reviews, shared between /testimonials and any page that wants
// to show a sample of them (e.g. general service pages).
export type Review = {
  who: string;
  text: string;
  rating: number;
  // Direct link to this specific review on Google Maps — only present for
  // live-fetched reviews (see lib/googleReviews.ts).
  googleMapsUri?: string;
};

// Used only if the live Google Places fetch (lib/googleReviews.ts) fails —
// keeps the reviews sections working even if the API key or network call
// has a problem.
export const REVIEWS: Review[] = [
  {
    who: "Michael Todd",
    text: "This family-owned and operated company did an excellent job — they safely took down several trees and handled everything with care and professionalism.",
    rating: 5,
  },
  {
    who: "Michael Whitworth",
    text: "Excellent experience from start to finish — professional, efficient, and clearly skilled. They removed several large trees quickly and safely, and left the yard spotless.",
    rating: 5,
  },
  {
    who: "Moses Mo",
    text: "Family owned, hard working, excellent clean up, on time, quick, fair pricing, works with client's budget, very satisfied with services!",
    rating: 5,
  },
  {
    who: "Eric Cayson",
    text: "Great service! Extremely professional and proficient. They have my highest recommendation.",
    rating: 5,
  },
  {
    who: "Charlie Conley",
    text: "These guys work hard and have the upmost care for the property. Very pleased with their work.",
    rating: 5,
  },
];
