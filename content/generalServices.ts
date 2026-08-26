// content/generalServices.ts
// Registry mapping a service's slug to its general (non-city-specific) page
// content. Add an entry here whenever a service's hasGeneralPage flag
// (lib/services.ts) flips to true.
import type { GeneralServicePageContent } from "./types";
import { TREE_REMOVAL_GENERAL_CONTENT } from "./general-services/tree-removal";
import { TREE_TRIMMING_GENERAL_CONTENT } from "./general-services/tree-trimming";
import { STUMP_GRINDING_GENERAL_CONTENT } from "./general-services/stump-grinding";
import { LOT_CLEARING_GENERAL_CONTENT } from "./general-services/lot-clearing";
import { EMERGENCY_TREE_SERVICE_GENERAL_CONTENT } from "./general-services/emergency-tree-service";

export const GENERAL_SERVICE_CONTENT: Record<string, GeneralServicePageContent> = {
  "tree-removal": TREE_REMOVAL_GENERAL_CONTENT,
  "tree-trimming": TREE_TRIMMING_GENERAL_CONTENT,
  "stump-grinding": STUMP_GRINDING_GENERAL_CONTENT,
  "lot-clearing": LOT_CLEARING_GENERAL_CONTENT,
  "emergency-tree-service": EMERGENCY_TREE_SERVICE_GENERAL_CONTENT,
};
