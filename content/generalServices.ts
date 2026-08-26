// content/generalServices.ts
// Registry mapping a service's slug to its general (non-city-specific) page
// content. Add an entry here whenever a service's hasGeneralPage flag
// (lib/services.ts) flips to true.
import type { GeneralServicePageContent } from "./types";
import { TREE_REMOVAL_GENERAL_CONTENT } from "./general-services/tree-removal";

export const GENERAL_SERVICE_CONTENT: Record<string, GeneralServicePageContent> = {
  "tree-removal": TREE_REMOVAL_GENERAL_CONTENT,
};
