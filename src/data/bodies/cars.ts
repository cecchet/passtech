import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "CARS Rule Book (National Rally Regulations)",
  version: "2026-03 (updated 2026-05-22)",
  url: "https://carsrally.ca/wp-content/uploads/2015/09/CARS-2026-03-En-Rule-Book.pdf",
};

const ARM_RESTRAINT_NOTE =
  "No dedicated arm-restraint requirement found in the CARS rulebook (checked for 'arm restraint,' 'restraint,' 'sleeve,' 'window net,' 'convertible,' 'open car/top'). Window nets (FIA and/or SFI certified, per the vehicle-eligibility technical rules) are the mechanism CARS actually uses for open-window/no-net conditions — that's vehicle equipment, not driver-worn PPE, so it's out of scope here.";

const performanceRally: Ruleset = {
  id: "cars-performance-rally",
  bodyId: "cars",
  bodyName: "CARS (Canadian Rally Championship)",
  disciplineName: "Performance Rally",
  disciplineGroup: "Rally",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "NRR 11.1.6-11.1.8" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8860-2010", expiresOn: "2028-12-31" },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "NRR 11.1.6" },
      confidence: "high",
      notes:
        "CARS does NOT accept Snell SA2015 for Performance Rally (unlike ARA, which does with a 12/31/2026 cutoff) — a real cross-body difference, so don't assume equivalence with ARA. CARS also non-bindingly recommends discarding any helmet after 5 years of regular use or after a serious accident — this is a recommendation, not a hard rule, so it is not encoded as an expiration here.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old." },
      ],
      citation: { ...sourceDoc, section: "NRR 11.1.7" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with approved fire-resistant underwear." },
      ],
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "high",
      notes: "One-piece suits highly recommended, not mandatory.",
    },
    gloves: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "'FIA or SFI gloves ... are recommended' — no specific certification number cited, and not mandatory. FIA 8856-2000/2018 and SFI 3.3 are mapped here as the practical standards, though CARS's own text doesn't name a number.",
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "medium",
    },
    shoes: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "'FIA or SFI ... shoes are recommended' — no specific certification number cited, and not mandatory. FIA 8856-2000/2018 and SFI 3.3 are mapped here as the practical standards, though CARS's own text doesn't name a number.",
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "medium",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only as a substitute when the driving suit itself is SFI 3.2A/1 (not addressed as a standalone recommendation otherwise).",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "CARS just says 'approved fire-resistant underwear' when required — no standard number attached in the rulebook.",
      citation: { ...sourceDoc, section: "NRR 11.1.8d" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 11.1" },
      confidence: "high",
      notes: ARM_RESTRAINT_NOTE,
    },
  },
};

const rallySprint: Ruleset = {
  id: "cars-rally-sprint",
  bodyId: "cars",
  bodyName: "CARS (Canadian Rally Championship)",
  disciplineName: "Rally Sprint",
  disciplineGroup: "Rally",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "NRR 28.3.3" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        ...(performanceRally.categories.helmet!.acceptedStandards ?? []),
        { standardId: "snell-sa2005", noExpiration: true, note: "Rally Sprint accepts the lower Snell SA2005+ bar in addition to full NRR 11.1.6 compliance." },
      ],
      citation: { ...sourceDoc, section: "NRR 28.3.3a" },
      confidence: "high",
      notes: "Lower bar than Performance Rally: 'Helmets meeting CARS NRR 11.1.6 or meeting the Snell SA 2005 standard.'",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: performanceRally.categories.hnr!.acceptedStandards,
      citation: { ...sourceDoc, section: "NRR 28.3.3b, cross-references NRR 11.1.7" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: performanceRally.categories.firesuit!.acceptedStandards,
      citation: { ...sourceDoc, section: "NRR 28.3.3g, cross-references NRR 11.1.8" },
      confidence: "high",
    },
    gloves: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same as Performance Rally: FIA/SFI rated recommended, not mandatory.",
      citation: { ...sourceDoc, section: "NRR 11.1.8 (cross-referenced)" },
      confidence: "medium",
    },
    shoes: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same as Performance Rally: FIA/SFI rated recommended, not mandatory.",
      citation: { ...sourceDoc, section: "NRR 11.1.8 (cross-referenced)" },
      confidence: "medium",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Same as Performance Rally: required only as a substitute when the suit itself is SFI 3.2A/1.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same as Performance Rally — 'approved fire-resistant underwear,' no standard number attached.",
      citation: { ...sourceDoc, section: "NRR 11.1.8d (cross-referenced)" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 28.3.3" },
      confidence: "high",
      notes: ARM_RESTRAINT_NOTE,
    },
  },
};

const rallyCross: Ruleset = {
  id: "cars-rally-cross",
  bodyId: "cars",
  bodyName: "CARS (Canadian Rally Championship)",
  disciplineName: "Rally Cross",
  disciplineGroup: "RallyCross",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "NRR 27.3.3" }],
  categories: {
    helmet: {
      requirement: "required",
      condition:
        "Vehicles WITH roll-over protection must meet the full Performance Rally standard (NRR 11.1.6). The looser list below applies only to vehicles WITHOUT roll-over protection — check your vehicle type before relying on the lower bar.",
      acceptedStandards: [
        ...(performanceRally.categories.helmet!.acceptedStandards ?? []),
        { standardId: "dot-2010plus", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "snell-m2005", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "snell-sa2005", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "ece-22.05", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "ece-22.06", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "astm-f3103-2005plus", noExpiration: true, note: "UTVs only." },
      ],
      citation: { ...sourceDoc, section: "NRR 27.3.3.1-27.3.3.2" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
      notes: "Not listed among Rally Cross mandatory items (unlike Performance Rally and Rally Sprint).",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
      notes: "No driving-suit requirement found for Rally Cross — only helmet and harness are mandated.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
      notes: "Open-top (convertible) vehicles are instead required to fit a hard top and/or roll-over protection approved by the regional scrutineer — not an arm restraint. " + ARM_RESTRAINT_NOTE,
    },
  },
};

export const carsRulesets: Ruleset[] = [performanceRally, rallySprint, rallyCross];
