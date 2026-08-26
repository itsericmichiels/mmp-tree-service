// lib/testimonials.ts
// Real Google reviews, shared between /testimonials and any page that wants
// to show a sample of them (e.g. general service pages).
export type Review = {
  who: string;
  text: string;
};

export const REVIEWS: Review[] = [
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
