export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
  // Whether a general, non-city-specific page exists for this service at
  // /<slug> (e.g. /tree-removal), covering North Georgia broadly rather
  // than one city. Built out one service at a time, same staged pattern
  // as CITIES' isBuilt flag.
  hasGeneralPage: boolean;
};

export const SERVICES: Service[] = [
  {
    slug: "tree-removal",
    name: "Tree Removal",
    shortDescription:
      "Safe, professional removal for trees of any size or condition.",
    icon: "tree-removal",
    hasGeneralPage: true,
  },
  {
    slug: "tree-trimming",
    name: "Tree Trimming",
    shortDescription:
      "Certified-arborist pruning that improves structure and long-term health.",
    icon: "tree-trimming",
    hasGeneralPage: true,
  },
  {
    slug: "stump-grinding",
    name: "Stump Grinding",
    shortDescription:
      "Stumps ground below grade so you can reclaim your yard fast.",
    icon: "stump-grinding",
    hasGeneralPage: true,
  },
  {
    slug: "lot-clearing",
    name: "Lot Clearing",
    shortDescription:
      "Complete vegetation removal and site prep for lots of any size.",
    icon: "lot-clearing",
    hasGeneralPage: true,
  },
  {
    slug: "emergency-tree-service",
    name: "Emergency Tree Service",
    shortDescription:
      "24/7 storm response — dangerous trees removed fast, insurance-ready.",
    icon: "emergency",
    hasGeneralPage: true,
  },
];
