// content/canton.ts
import type { CityContent } from "./types";

export const CANTON_CONTENT: CityContent = {
  hub: {
    intro:
      "Canton, GA sits at the heart of Cherokee County, where new subdivisions push up against mature stands of pine and hardwood along the Etowah River. That mix — established tree canopy next to fresh construction — is exactly what keeps our crews busy here: storm-damaged hardwoods near Boling Park, pines thinned for new lots off Riverstone Parkway, and the clay-heavy Piedmont soil that makes stump removal tougher than it looks.",
    whyUs: [
      "Local knowledge of Cherokee County's clay soil and root systems",
      "Experience with Canton's mix of mature hardwoods and new-construction pines",
      "Fast response for storm damage along the Etowah River corridor",
      "Licensed, insured, and ISA-certified arborists on every crew",
    ],
  },
  services: {
    "tree-removal": {
      intro:
        "Canton's older neighborhoods near downtown carry decades-old oaks and hickories, many planted well before today's setback rules — which means removal often has to thread between a house, a driveway, and a neighbor's fence line. We plan every Canton removal around what's actually on the lot, not a generic checklist.",
      howItWorks: {
        title: "How Tree Removal Works in Canton",
        body:
          "We start with an on-site assessment of the tree's lean, root condition, and surrounding structures — critical in Canton's tighter, older lots. For larger hardwoods, we section the tree down piece by piece using rigging rather than a single fell, protecting driveways, fences, and neighboring yards. Cherokee County's clay soil holds moisture longer after rain, which affects root stability and crew scheduling around wet ground.",
      },
      cost: {
        title: "What Tree Removal Costs in Canton",
        body:
          "Most single-tree removals in Canton run from a few hundred dollars for a small, easily accessed tree to several thousand for a large hardwood near a structure requiring rigging and crane support. The biggest cost factors here are proximity to the house, whether power lines cross the removal path, and stump handling.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Cherokee County's red clay compacts hard when dry and turns slick when wet, which affects both equipment access and how we protect your lawn during the job. Many Canton properties near the Etowah River floodplain also have root systems weakened by periodic flooding — we check for this during assessment, since it changes how a tree needs to come down.",
      },
      faqs: [
        {
          question: "Do I need a permit to remove a tree in Canton, GA?",
          answer:
            "It depends on the tree's size, species, and whether the property is inside city limits versus unincorporated Cherokee County — rules differ between the two. We'll flag if your specific removal likely needs a permit during the estimate.",
        },
        {
          question: "How quickly can you remove a storm-damaged tree in Canton?",
          answer:
            "For active hazards — a leaning or split tree threatening a house or driveway — we prioritize same-day or next-day response. Call our 24/7 line for anything urgent.",
        },
        {
          question: "Will you remove the stump too?",
          answer:
            "Stump grinding is a separate service — see our Canton stump grinding page — but we're happy to quote both together in one visit.",
        },
        {
          question: "What happens to the wood after removal?",
          answer:
            "By default we haul and dispose of all debris. If you'd like to keep firewood-length rounds, let us know before the job and we'll leave what you want.",
        },
        {
          question: "Do you work near power lines in Canton?",
          answer:
            "Yes, but for lines directly in the drop zone we coordinate timing carefully and, when required, loop in the utility company before cutting.",
        },
      ],
    },
    "tree-trimming": {
      intro:
        "Between the shade canopy in Canton's established neighborhoods and the young, fast-growing pines on newer lots, trimming needs here vary a lot by street. We prune for structure and long-term health, not just a quick haircut.",
      howItWorks: {
        title: "How Tree Trimming Works in Canton",
        body:
          "Our ISA-certified arborists assess each tree's branching structure before making a cut, removing dead or crossing limbs first, then thinning for airflow and light. For Canton's younger pine stands on newer lots, we focus on early structural pruning that prevents costly problems as the trees mature.",
      },
      cost: {
        title: "What Tree Trimming Costs in Canton",
        body:
          "Routine trimming for a mid-size shade tree typically runs less than removal, scaling up with tree height, number of trees, and access difficulty. Multi-tree jobs on larger Canton lots often get a better per-tree rate.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Pine stands common on Canton's newer development lots are prone to storm breakage if not thinned properly — we watch for this on every trim. In older neighborhoods, we're careful trimming near century-old oaks whose root systems can be sensitive to heavy equipment traffic.",
      },
      faqs: [
        {
          question: "When is the best time of year to trim trees in Canton?",
          answer:
            "Late winter, while trees are dormant, is ideal for most structural pruning — though dead or hazardous limbs should be removed any time of year.",
        },
        {
          question: "Can trimming help my trees survive Georgia storms better?",
          answer:
            "Yes — thinning dense canopy reduces wind resistance, which is one of the most effective ways to reduce storm damage risk on established trees.",
        },
        {
          question: "Do you trim trees near power lines?",
          answer:
            "We handle line-adjacent trimming carefully and coordinate with the utility company when clearance work near primary lines is required.",
        },
        {
          question: "How often should trees be trimmed?",
          answer:
            "Most mature shade trees benefit from trimming every 2-3 years; younger or fast-growing pines may need more frequent structural attention.",
        },
        {
          question: "Will trimming hurt my tree?",
          answer:
            "Proper pruning by a certified arborist improves tree health. Improper cuts — especially topping — can permanently weaken a tree, which is why we avoid that practice entirely.",
        },
      ],
    },
    "stump-grinding": {
      intro:
        "Cherokee County's dense clay soil makes stump removal harder than it looks from the surface — roots anchor deep and wide, and clay resists the kind of clean extraction easier sandy soils allow. Grinding below grade is usually the faster, less disruptive path for Canton yards.",
      howItWorks: {
        title: "How Stump Grinding Works in Canton",
        body:
          "We grind the stump and surface roots below grade using a mechanical grinder, leaving a bed of wood chips you can backfill with soil. For Canton's clay-heavy lots, we often need extra passes since compacted clay holds the stump and root ball more firmly than looser soil types.",
      },
      cost: {
        title: "What Stump Grinding Costs in Canton",
        body:
          "Pricing scales with stump diameter and root spread — small stumps are quick, while large hardwood stumps with wide surface roots take longer to grind fully below grade. Grinding multiple stumps in one visit typically costs less per stump than separate trips.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Because Cherokee County clay compacts and holds moisture, freshly ground stump areas may settle over the following months as the clay dries and shifts — we let customers know to expect some settling before final landscaping.",
      },
      faqs: [
        {
          question: "How deep do you grind the stump?",
          answer:
            "Typically 4-6 inches below grade, enough to plant grass or light landscaping over the spot without hitting wood.",
        },
        {
          question: "Can I plant a new tree in the same spot?",
          answer:
            "Usually yes, though we recommend waiting for the ground to settle and, for the same species, choosing a slightly offset spot to avoid old root competition.",
        },
        {
          question: "What do you do with the wood chips?",
          answer:
            "We can leave them on-site for mulch or haul them away — your choice, no extra charge either way for standard jobs.",
        },
        {
          question: "Is stump grinding better than full stump removal?",
          answer:
            "For most residential yards, yes — grinding is faster, less disruptive to surrounding soil, and costs less. Full removal is only needed when every root must come out, such as before building on that exact spot.",
        },
        {
          question: "Will grinding damage my irrigation or utility lines?",
          answer:
            "We ask about buried lines before starting and grind conservatively near any marked utilities.",
        },
      ],
    },
    "lot-clearing": {
      intro:
        "With new subdivisions continuing to fill in around Canton and along the Riverstone Parkway corridor, lot clearing is one of our most requested services from builders and homeowners preparing raw land for construction.",
      howItWorks: {
        title: "How Lot Clearing Works in Canton",
        body:
          "We assess the full lot for tree density, species mix, and terrain before clearing, removing trees, brush, and stumps in a sequence that keeps the site accessible for equipment throughout the job. Cherokee County's rolling terrain often means grading considerations factor into how we stage debris removal.",
      },
      cost: {
        title: "What Lot Clearing Costs in Canton",
        body:
          "Cost depends heavily on lot size, tree density, and whether stumps need full removal or grinding. Wooded residential lots typically cost less to clear than heavily forested acreage requiring extensive debris hauling.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Cherokee County has tree ordinance and buffer requirements in some zoning districts, particularly near the Etowah River corridor — we flag likely buffer-zone restrictions during the site walk so clearing plans stay compliant.",
      },
      faqs: [
        {
          question: "Do I need a permit to clear a lot in Canton?",
          answer:
            "Larger clearing projects, especially for new construction, typically require permits through Cherokee County or the City of Canton depending on location — we help identify what applies to your specific lot.",
        },
        {
          question: "Can you clear a lot that's still partially wooded but keep some trees?",
          answer:
            "Yes — selective clearing to preserve specific trees or a tree line is common and something we plan for during the walk-through.",
        },
        {
          question: "How long does lot clearing take?",
          answer:
            "A typical residential lot takes a few days; larger or heavily wooded acreage can take longer depending on density and access.",
        },
        {
          question: "What happens to the cleared debris?",
          answer:
            "We hall debris off-site by default, though some clients choose to have wood chipped and left on-site for erosion control during construction.",
        },
        {
          question: "Do you work with builders directly?",
          answer:
            "Yes, we regularly coordinate directly with builders and contractors on new-construction timelines in the Canton area.",
        },
      ],
    },
    "emergency-tree-service": {
      intro:
        "Georgia's pop-up thunderstorms and occasional ice events hit Cherokee County hard, and Canton's mix of mature hardwoods and newer pine stands means storm damage can strike either an old oak limb or a stressed young pine. We run 24/7 emergency response specifically for this.",
      howItWorks: {
        title: "How Emergency Tree Service Works in Canton",
        body:
          "When you call our 24/7 line, we prioritize active hazards — trees on structures, blocking driveways, or leaning dangerously — for same-day response where possible. Our crews stabilize or remove the immediate hazard first, then handle full cleanup and, if needed, document damage for your insurance claim.",
      },
      cost: {
        title: "What Emergency Tree Service Costs in Canton",
        body:
          "Emergency pricing depends on severity, time of day, and access — a tree resting on a roof after hours costs more to address urgently than daytime cleanup of a fallen limb. We provide a clear quote before starting work whenever the situation allows.",
      },
      localConsiderations: {
        title: "Canton-Specific Considerations",
        body:
          "Canton sees both summer microburst thunderstorms and occasional winter ice storms, each stressing trees differently — ice loads snap brittle limbs, while high wind uproots trees weakened by Cherokee County's saturated clay soil after heavy rain.",
      },
      faqs: [
        {
          question: "Are you available 24/7 for emergencies in Canton?",
          answer:
            "Yes — call (470) 403-0215 any time, day or night, for active storm damage or a hazardous tree.",
        },
        {
          question: "Do you work with homeowners insurance?",
          answer:
            "Yes, we document damage clearly and work directly with insurance companies to help streamline claims.",
        },
        {
          question: "What should I do while waiting for your crew to arrive?",
          answer:
            "Stay away from the damaged tree and any downed power lines, and avoid entering rooms directly under a tree resting on your roof until we've assessed stability.",
        },
        {
          question: "Can you remove a tree that's already fallen on my house?",
          answer:
            "Yes — this is one of our most common emergency calls. We remove the tree carefully to avoid further structural damage and can coordinate with your insurance adjuster.",
        },
        {
          question: "How fast can you respond after a storm?",
          answer:
            "For active hazards we prioritize same-day response whenever conditions allow safe access; response time may extend slightly during major, area-wide storm events.",
        },
      ],
    },
  },
};
