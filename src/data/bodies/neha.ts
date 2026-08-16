import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "New England Hillclimb Association Rules",
  version: "2026 Edition",
  url: "https://www.hillclimb.org/rules_regs/hillclimb_rules/2026rules.pdf",
};

const helmetStandards = [
  { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "SA2015 will be discontinued at the end of the 2026 season per this rulebook's own change note." },
  { standardId: "snell-sa2020", noExpiration: true },
  { standardId: "snell-sa2025", noExpiration: true },
  { standardId: "fia-8860-2010", validityYearsFromLabel: 10, note: "FIA 8860-20XX accepted with a manufacture date under 10 years old." },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
];

const certifiedFiresuitStandards = [
  { standardId: "fia-8856-2000" },
  { standardId: "fia-8856-2018" },
  { standardId: "fia-1986", note: "2026 rules: now requires approved fire-resistant underwear be worn with this standard." },
  { standardId: "sfi-3.2a-5" },
  { standardId: "sfi-3.4-5" },
  { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear." },
];

// NEHA §1.3.12 "Arm Restraints" applies to ALL vehicles regardless of tier, identically.
const armRestraintRule = {
  requirement: "conditional" as const,
  condition:
    "Closed cars with the window raised enough to keep arms inside (or a window net) are exempt. Cars with no roof or convertible tops must wear arm restraints outright. Any car with the window down and no net must wear them.",
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "No certification standard cited by NEHA for this item.",
  citation: { ...sourceDoc, section: "1.3.12.1-1.3.12.2" },
  confidence: "high" as const,
};

// "X" / non-competitive entrants: NEHA General Rules for All Vehicles (section 1.3)
const hillclimbX: Ruleset = {
  id: "neha-x",
  bodyId: "neha",
  bodyName: "NEHA (New England Hillclimb Association)",
  disciplineName: "Hillclimb — X / breakout-limited entrant",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "1.3 Rules for All Vehicles" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: helmetStandards,
      citation: { ...sourceDoc, section: "1.3.3.1-1.3.3.3" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "high",
      notes: "HANS/HNR is only required for non-X (competitive) entrants — see the 'Hillclimb — competitive (non-X)' ruleset.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: certifiedFiresuitStandards,
      materialNote:
        "Basic fire-resistant clothing required for all entrants: cotton, linen, leather, or wool — no meltable synthetics. A certified driving suit is NOT required at this tier, but obviously also satisfies it if you have one.",
      citation: { ...sourceDoc, section: "1.3.1" },
      confidence: "high",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "high",
      notes: "Gloves are only required for non-X (competitive) entrants.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Fire-resistant material; no platform, high-heel, open, or sandal-style shoes.",
      citation: { ...sourceDoc, section: "1.3.2" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "high",
      notes: "No certified suit required at this tier, so the conditional fire-resistant-underwear rule doesn't apply.",
    },
    arm_restraint: armRestraintRule,
  },
};

// Non-X / competitive entrants: NEHA §1.4 "Vehicles Running Faster than Breakout Time"
const hillclimbCompetitive: Ruleset = {
  id: "neha-competitive",
  bodyId: "neha",
  bodyName: "NEHA (New England Hillclimb Association)",
  disciplineName: "Hillclimb — competitive (non-X, running for time)",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "1.4 Vehicles Running Faster than Breakout Time" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: helmetStandards,
      citation: { ...sourceDoc, section: "1.3.3.1-1.3.3.3 (applies to all entrants)" },
      confidence: "high",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true, note: "Required standard for Hybrid-type systems." },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old. All tethers must be less than 5 years old." },
      ],
      citation: { ...sourceDoc, section: "1.4.2.1-1.4.2.4" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: certifiedFiresuitStandards,
      citation: { ...sourceDoc, section: "1.4.1.2" },
      confidence: "high",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "SFI or FIA rated, in good condition (no stains or holes) — a certified item is required at this tier, plain material doesn't qualify.",
      citation: { ...sourceDoc, section: "1.4.1.5" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Fire-resistant material, no platform/high-heel/open/sandal (base rule) plus: uppers of leather or nonflammable material covering at minimum the instep. No certification number required.",
      citation: { ...sourceDoc, section: "1.3.2 and 1.4.1.7" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Mandatory if using an SFI 3.2A/1 suit, or (new in 2026) an FIA 1986-standard suit.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "NEHA names the standard explicitly here: '(FIA Standard 8856-2000 or SFI 3.3 Specification)' — a certified item is required when this condition applies, not just any fire-resistant material.",
      citation: { ...sourceDoc, section: "1.4.1.2-1.4.1.3" },
      confidence: "high",
    },
    arm_restraint: armRestraintRule,
  },
};

export const nehaRulesets: Ruleset[] = [hillclimbX, hillclimbCompetitive];
