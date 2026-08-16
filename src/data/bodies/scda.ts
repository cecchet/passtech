import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const techForm = {
  title: "SCDA Tech Inspection Form",
  version: "2026 Annual Inspection",
  url: "https://scda1.com/wp-content/uploads/2026/03/Sports-Car-Driving-Association-Tech-Inspection.pdf",
};

const faq = {
  title: "SCDA Driving & Track Event FAQ",
  url: "https://scda1.com/faq/",
};

// Tech form item 3-4: "Must be SNELL SA2020, SA2025, FIA 8859 or FIA 8860. FIA rated helmets
// must not exceed 10yrs from manufactured date. Any other helmet ratings are not acceptable.
// Either open or closed face. IF convertible, then closed face with visor down."
const helmetStandards = [
  { standardId: "snell-sa2020", noExpiration: true, note: "Tech form names only SA2020 and SA2025 as accepted Snell generations; no separate age-based expiration is stated for these beyond accepting only these two ratings." },
  { standardId: "snell-sa2025", noExpiration: true },
  { standardId: "fia-8859-2020", validityYearsFromLabel: 10, note: "Tech form cites 'FIA 8859' generically without a generation suffix: 'FIA rated helmets must not exceed 10yrs from manufactured date.'" },
  { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2024", validityYearsFromLabel: 10 },
];

const helmetRule = {
  requirement: "required" as const,
  acceptedStandards: helmetStandards,
  fullFaceRequirement: "conditional" as const,
  fullFaceCondition: "Closed face with visor down required for convertible cars. Open-face permitted in fixed-roof (closed) cars.",
  citation: { ...techForm, section: "Item 3 (Helmets) and Item 4 (Convertible policy)" },
  confidence: "high" as const,
  notes: "'Any other helmet ratings are not acceptable' per the tech form — this excludes Snell SA2015 and earlier, SFI-rated, DOT-only, and ECE helmets outright, a noticeably stricter list than most bodies in this app.",
};

const notAddressedUndergarment = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "Not mentioned in either the tech inspection form or the event FAQ, for any car type.",
};

const notAddressedArmRestraint = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "Not mentioned by SCDA at the organization level for any car type, including convertibles/open cars. Specific host tracks may impose their own requirement independent of SCDA.",
};

// Street-prepared / stock cockpit cars: general Dress Code (FAQ) plus base helmet rule.
const hpdeStreet: Ruleset = {
  id: "scda-hpde-street",
  bodyId: "scda",
  bodyName: "SCDA (Sports Car Driving Association)",
  disciplineName: "HPDE Track Day — street-prepared car",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForm, faq],
  categories: {
    helmet: helmetRule,
    hnr: {
      requirement: "recommended",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
      notes: "FAQ: 'Proper Head and Neck restraint system is HIGHLY encouraged' — not a hard requirement for a street-prepared car. See the fully-caged/track-prepped/race-car ruleset for the tech form's separate H&NR mention at that tier (also only 'recommended' there).",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...techForm, section: "Item 13" },
      confidence: "high",
      notes: "SCDA's 2-layer SFI/FIA driving-suit requirement (tech form item 13) applies only to fully caged, track-prepped, or race cars — see the separate 'fully caged / track-prepped / race car' ruleset. Not required for a street-prepared car. Separately, the general Dress Code requires long pants (suggests long sleeves) for all drivers regardless of car prep; that's a plain clothing rule, not a fire-resistant garment requirement, so it is not reflected in this category.",
    },
    gloves: {
      requirement: "recommended",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "FAQ: 'Driving Gloves are suggest[ed]' — optional at this tier, no material or certification specified.",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "FAQ Dress Code: driving shoes or sneakers required; no boots, no open-toe shoes/sandals. No fire-resistance or certification specified.",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
    },
    undergarment: notAddressedUndergarment,
    arm_restraint: notAddressedArmRestraint,
  },
};

// Fully caged / track-prepped / race car: tech form item 13. "Track prepped car" is defined there as
// "Vehicle in which the cockpit has been altered or modified in any way so that any part of the
// chassis or any firewall has been exposed."
const hpdeCaged: Ruleset = {
  id: "scda-hpde-caged",
  bodyId: "scda",
  bodyName: "SCDA (Sports Car Driving Association)",
  disciplineName: "HPDE Track Day — fully caged / track-prepped / race car",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForm, faq],
  categories: {
    helmet: helmetRule,
    hnr: {
      requirement: "recommended",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002" },
        { standardId: "fia-8858-2010" },
      ],
      citation: { ...techForm, section: "Item 13" },
      confidence: "high",
      notes: "'A SFI or FIA head and neck restraint device is also recommended' — still only recommended, not mandatory, even for a fully caged/track-prepped/race car per the tech form's exact wording.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
      ],
      materialNote: "Minimum 2-layer SFI- or FIA-approved driving suit ('SFI 3.2A/1' single-layer suits do not meet the stated 2-layer minimum).",
      citation: { ...techForm, section: "Item 13" },
      confidence: "high",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Tech form item 13 groups gloves with the required 2-layer SFI/FIA driving suit ('a minimum of a 2-layer approved SFI or FIA driving suit, gloves and shoes per track mandates'), read here as SFI/FIA-rated gloves required.",
      citation: { ...techForm, section: "Item 13" },
      confidence: "medium",
      notes: "The phrase 'per track mandates' introduces some ambiguity — SCDA may be deferring the exact glove standard to whatever the specific host track separately requires, rather than mandating a certification itself at the org level. Treated here as a certification requirement to stay conservative; worth spot-checking against a specific event's supplemental rules.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same tech-form item 13 language as gloves above — SFI/FIA-rated shoes read as required for a fully caged/track-prepped/race car.",
      citation: { ...techForm, section: "Item 13" },
      confidence: "medium",
      notes: "Same 'per track mandates' ambiguity as gloves — see note there.",
    },
    undergarment: notAddressedUndergarment,
    arm_restraint: notAddressedArmRestraint,
  },
};

export const scdaRulesets: Ruleset[] = [hpdeStreet, hpdeCaged];
