import { Ruleset } from "../types";

const sourceDoc = {
  title: "2026 AMEC Ice Racing Rules",
  version: "Revision 1, January 2026",
  url: "https://icerace.com/wp-content/uploads/2026/01/AMEC-rules-2026.pdf",
};

// AMEC's driver-equipment rules (§2.2) apply uniformly across all of its car classes (Street
// Legal, Street Legal Modified, Stock Sportsman, Modified, Super Modified Closed/Open,
// All-Wheel-Drive, Open) — the classes differ in car prep and roll cage/harness requirements,
// not driver-worn PPE, so a single ruleset covers the whole club.
const iceRacing: Ruleset = {
  id: "amec-ice-racing",
  bodyId: "amec",
  bodyName: "AMEC (Adirondack Motor Enthusiast Club)",
  disciplineName: "Ice Racing",
  disciplineGroup: "Ice Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "2.2 Driver Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2010", noExpiration: true },
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "2.2.1" },
      confidence: "high",
      notes:
        "Rule text: 'SNELL SA2010 or newer helmets are required.' No FIA/SFI alternative is offered, and no full-face requirement is stated for the general driver population (the narrow 14-17-year-old no-license exception in §2.1.3.7 does specify full-face, but that's not the general rule — see notes on other categories). Helmet must be presented at tech inspection; an AMEC sticker is affixed to the left side once approved.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.1.3.7" },
      confidence: "high",
      notes:
        "Confirmed real gap for the general driver population: §2.2 Driver Equipment names only the helmet. A 'neck brace' is required only under the narrow 14-17-year-old no-driver's-license exception (§2.1.3.7: 'A SNELL SA2010 or newer full-face helmet, neck brace, safety-approved racing uniform and safety-approved set of racing gloves must be worn') — not modeled as the general rule since it's a minor-specific carve-out, not the base requirement.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.1.3.7" },
      confidence: "high",
      notes:
        "Confirmed real gap: no firesuit/driving-suit requirement, standard, or recommendation for the general driver population anywhere in §2.2 or elsewhere. A 'safety-approved racing uniform' is required only under the same narrow 14-17-year-old exception noted for HNR (§2.1.3.7).",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.1.3.7" },
      confidence: "high",
      notes:
        "Confirmed real gap: no glove requirement for the general driver population. A 'safety-approved set of racing gloves' is required only under the same narrow 14-17-year-old exception noted for HNR and firesuit (§2.1.3.7).",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook, for any driver.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3.5.2.7" },
      confidence: "high",
      notes:
        "No general driver-worn arm restraint requirement. The only mention is class-specific: Super Modified Closed (SMC) cars with the driver's door glass removed must have a Lexan window, window net, OR arm restraint at that door (§3.5.2.7) — a per-class vehicle-equipment choice, not a universal driver PPE mandate, so it isn't modeled as required here.",
    },
  },
};

export const amecRulesets: Ruleset[] = [iceRacing];
