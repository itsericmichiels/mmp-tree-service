export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  icon: string;
};

export const SERVICES: Service[] = [
  {
    slug: "tree-removal",
    name: "Tree Removal",
    shortDescription:
      "Safe, professional removal for trees of any size or condition.",
    icon: "tree-removal",
  },
  {
    slug: "tree-trimming",
    name: "Tree Trimming",
    shortDescription:
      "Certified-arborist pruning that improves structure and long-term health.",
    icon: "tree-trimming",
  },
  {
    slug: "stump-grinding",
    name: "Stump Grinding",
    shortDescription:
      "Stumps ground below grade so you can reclaim your yard fast.",
    icon: "stump-grinding",
  },
  {
    slug: "lot-clearing",
    name: "Lot Clearing",
    shortDescription:
      "Complete vegetation removal and site prep for lots of any size.",
    icon: "lot-clearing",
  },
  {
    slug: "emergency-tree-service",
    name: "Emergency Tree Service",
    shortDescription:
      "24/7 storm response — dangerous trees removed fast, insurance-ready.",
    icon: "emergency",
  },
];
