import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "PCA National HPDE Committee - Minimum Standards",
  version: "Rev. 1/15/26, FINAL 2026",
  url: "https://mediaassets.pca.org/docs/formsanddocs/94/2026%20HPDE%20Minimum%20Standards.pdf",
};

// PCA's national Minimum Standards apply uniformly to Driver Education (DE) / HPDE events across
// all run groups (Novice/Beginner/Intermediate/Advanced/Solo naming varies by region). The one
// run-group-flavored nuance — Snell M-rated helmets being explicitly called out as permitted only
// for novice run groups, with higher groups merely "encouraged" (not required) to move to SA — is
// a soft distinction, not a hard block, so it's captured in a note rather than split into a
// separate ruleset. Regions may impose stricter rules than this national floor; none may be looser.
const de: Ruleset = {
  id: "pca-de",
  bodyId: "pca",
  bodyName: "PCA (Porsche Club of America)",
  disciplineName: "Driver Education (DE) — HPDE",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [sourceDoc],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", validityYearsFromLabel: 10, note: "Current Snell SA generation." },
        { standardId: "snell-sa2020", validityYearsFromLabel: 10, note: "Immediately-preceding Snell SA generation. This entry will need to roll forward once a newer SA generation supersedes SA2025 as 'current'." },
        { standardId: "snell-m2025d", validityYearsFromLabel: 10, note: "M-rated Snell helmets are explicitly 'permitted for HPDE Events novice run groups'; the document doesn't name a specific M-generation, so current-era M ratings are listed here as a reasonable default." },
        { standardId: "snell-m2025r", validityYearsFromLabel: 10 },
        { standardId: "snell-m2020d", validityYearsFromLabel: 10 },
        { standardId: "snell-m2020r", validityYearsFromLabel: 10 },
        { standardId: "sfi-31.1-2020", validityYearsFromLabel: 10, note: "Document cites 'SFI 31.1' generically without a year/slash-level." },
        { standardId: "sfi-31.1-2015", validityYearsFromLabel: 10 },
        { standardId: "bs-6658-1985", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2020", validityYearsFromLabel: 10, note: "Document cites 'FIA (for racing automobiles)' generically without a specific spec number." },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
      ],
      citation: { ...sourceDoc, section: "11(b) Helmet" },
      confidence: "medium",
      notes:
        "'Helmets with a printed manufacture date expire at the end of the 10th year following the year of manufacture' — applied uniformly above as a 10-year validity window from the label date. Snell M-rated helmets are explicitly permitted only for novice run groups per this document ('Snell M-rated helmets are permitted for HPDE Events novice run groups, however, participants are encouraged to upgrade to a Snell SA helmet when moving into higher run groups') — that's a soft encouragement rather than a hard rule for higher groups, so it isn't modeled as a separate ruleset; some regional programs may enforce SA-only for higher groups more strictly. The SFI/FIA/BS entries above are reasonable representative generations for those generically-named specs, not verified name-for-name against the document. 'Other helmets may also be acceptable if they are approved for PCA Club Racing (SFI, FIA)' per the Club Racing rulebook — not modeled here as Club Racing is a separate wheel-to-wheel program out of scope for this app.",
    },
    hnr: {
      requirement: "conditional",
      condition:
        "Required only when the car is fitted with a competition harness system of five or more attachment points (SFI or FIA approved). Not required when using the stock/factory 3-point seatbelt. §10(g): 'An approved head and neck restraint device is required for all cars using harness systems. Cars must not be allowed on track if the Entrants do not have a head and neck restraint device while using harnesses.'",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "Document: 'it is recommended that the straps be replaced every five years' — stated as a recommendation, not a hard expiration rule." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "10(g) Harness Systems" },
      confidence: "high",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "11(c) Footwear and Clothing" },
      confidence: "high",
      notes:
        "Not required at the national minimum-standard level. The document explicitly leaves this to individual Regions/Facilities: 'Facilities or Regions may have more specific requirements for footwear and clothing, including the possibility of fire-resistant race suits.' Check your specific PCA region's supplemental rules.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "'Footwear must be enclosed (not open-toe), non-slip, with a relatively smooth sole. Hiking-type deep lugged soles are not acceptable.' No fire-resistance or certification required at the national level.",
      citation: { ...sourceDoc, section: "11(c) Footwear and Clothing" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for (1) convertible/cabriolet cars driven with the top down — §10(d): 'If the top is in the down position, an SFI and/or FIA approved arm restraint system must be used'; and (2) all occupants of open-wheel/open-cockpit cars, regardless of run group — §10(e). Not required for closed cars, or convertibles driven top-up/hardtop-installed with factory rollover protection.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Must be SFI and/or FIA approved when required — plain fire-resistant material does not qualify.",
      citation: { ...sourceDoc, section: "10(d)-10(e)" },
      confidence: "high",
    },
  },
};

export const pcaRulesets: Ruleset[] = [de];
