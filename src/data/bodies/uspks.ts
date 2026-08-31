import { Ruleset } from "../types";

// USPKS (United States Pro Kart Series) — third karting body in this pass, after NKA and SKUSA.
// Only DRIVER safety gear is modeled (see nka.ts for why car/rollover-protection categories are
// omitted entirely). Section 102 ("Safety") is the single source for everything here.
const sourceDoc = {
  title: "2026 USPKS Rulebook",
  version: "Rev. 05-16-26",
  url: "https://www.uspks.com/regulations/",
};

const s102 = { ...sourceDoc, section: "102 Safety" };

// Chest protectors (SFI 20.1 or FIA-approved, mandatory under age 13 in all divisions) are a real
// USPKS requirement but not modeled — this app has no chest-protector category (declined when
// scoping this pass).

const HELMET_STANDARDS = [
  // Rule text: "The helmet will expire at the end of the year 10 years after the manufacture's
  // date or specification sticker" — a uniform 10-year-from-label rule across every listed spec.
  // Snell certification tags don't print a manufacture/expiration date the way SFI/FIA labels do,
  // so the Snell entries below are computed as 10 years from each standard's own release year
  // instead, matching the fixed-calendar-date convention other karting bodies in this app use.
  { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018-abp", validityYearsFromLabel: 10 },
  { standardId: "snell-cmr2016", expiresOn: "2026-12-31", note: "Youth kart-specific rating." },
  { standardId: "snell-cms2016", expiresOn: "2026-12-31", note: "Youth kart-specific rating." },
  { standardId: "snell-k2020", expiresOn: "2030-12-31" },
  { standardId: "snell-m2020d", expiresOn: "2030-12-31" },
  { standardId: "snell-m2020r", expiresOn: "2030-12-31" },
  { standardId: "snell-sa2020", expiresOn: "2030-12-31" },
  { standardId: "snell-k2025", expiresOn: "2035-12-31" },
  { standardId: "snell-m2025d", expiresOn: "2035-12-31" },
  { standardId: "snell-m2025r", expiresOn: "2035-12-31" },
  { standardId: "snell-sa2025", expiresOn: "2035-12-31" },
  { standardId: "sfi-24.1-2020", validityYearsFromLabel: 10 },
  { standardId: "sfi-24.1-2021", validityYearsFromLabel: 10 },
  { standardId: "sfi-31.1-2020", validityYearsFromLabel: 10 },
  { standardId: "sfi-41.1-2020", validityYearsFromLabel: 10 },
];

const uspksKarting: Ruleset = {
  id: "uspks-karting",
  bodyId: "uspks",
  bodyName: "USPKS (United States Pro Kart Series)",
  disciplineName: "Karting — Sprint",
  disciplineGroup: "Karting",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sourceDoc],
  knownGaps: [
    "Chest protector: SFI 20.1-rated device required for all drivers under 13, in every division — this app doesn't track this as its own category.",
  ],
  classes: [
    { id: "junior", label: "All classes except Senior/Masters" },
    { id: "senior-masters", label: "Senior/Masters classes" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: HELMET_STANDARDS,
      fullFaceRequirement: "required",
      citation: { ...s102, section: "102.1, Helmet" },
      confidence: "high",
      notes: "Shield must be attached. Helmet is inspected pre-race and gets a safety sticker once approved; it can be re-inspected any time after an on- or off-track incident.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "If your hair could extend past your shoulders, it must be tucked inside your suit or jacket to prevent it from tangling in moving parts — a head sock (balaclava) is one accepted way to manage this, not a separate standalone mandate.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s102, section: "102.1, Helmet" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: s102,
      confidence: "high",
      notes: "Not addressed as its own category — most karts don't have the multi-point harness a HANS-style device tethers to. USPKS's own Neck Collar requirement (see that category) is the accepted form of neck protection here.",
    },
    neck_collar: {
      requirement: "conditional",
      condition: "Mandatory for all classes except Senior/Masters, which do not require one (though it's still recommended). Select a class to see which applies to you.",
      materialOnlyAccepted: true,
      materialNote: "As manufactured, unaltered. No certification standard is cited. Approved \"advanced neck and head\" devices (recommended for drivers of all ages, on top of whichever tier applies) are named specifically: Leatt-Brace Moto Kart and Moto GPX, EVS Evolution Race Collar, Valhalla 360 Plus Device.",
      citation: { ...s102, section: "102.2, Neck Collar" },
      confidence: "high",
      notes: "If a driver doesn't have a neck collar on, loses it, or it becomes loose while on track (in a class where it's mandatory), they're black-flagged immediately.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Ballistic nylon, leather, vinyl, or other abrasion-resistant jacket with full-length pants (or a one-piece suit) — NOT a fire-resistance requirement the way car-racing firesuit rules are. All exposed skin should be covered; sweatpants explicitly don't qualify. No certification standard (e.g. CIK-FIA Level 2) is cited.",
      citation: { ...s102, section: "102.4, Driver Attire" },
      confidence: "high",
      notes: "Hooded sweatshirts, bandanas, or long belts that could tangle in moving parts are prohibited.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s102, section: "102.4, Driver Attire" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Closed-toe shoes required. No certification standard is cited.",
      citation: { ...s102, section: "102.4, Driver Attire" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Required alongside closed-toe shoes. No certification standard is cited.",
      citation: { ...s102, section: "102.4, Driver Attire" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: s102,
      confidence: "medium",
      notes: "Not mentioned in the safety section reviewed.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: s102,
      confidence: "medium",
      notes: "Not mentioned anywhere in the rulebook — not a typical kart safety item given the open cockpit design.",
    },
    // hood_pins/spill_kit are car-group categories, unlike the driver-gear-only categories above
    // (see the file-header note on why car categories are otherwise omitted entirely for karting).
    // These two are newly tracked app-wide, so they're checked and recorded explicitly here even
    // though the answer for karting is a confident "not applicable."
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "201.16, Bodywork Components" },
      confidence: "high",
      notes: "USPKS karts have no hood/engine cover — bodywork is defined as two side pods, a nose cone, and a driver fairing, with the nose cone secured by OEM butterfly clamps (CIK-homologated push-back mounts on IAME classes). The rulebook covers bodywork attachment in detail and never mentions hood pins or an equivalent fastener-security requirement.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "506.14, Radiator" },
      confidence: "medium",
      notes: "No requirement for a driver-carried spill kit (absorbent material) anywhere in the rulebook. Water-cooled classes (X30, KZ) do require \"a radiator catch container for overflow\" (506.14, 507.11) — a narrower, built-in overflow-catch requirement rather than a portable absorbent spill-cleanup kit, so it isn't modeled as satisfying this category.",
    },
  },
  classOverrides: {
    junior: {
      neck_collar: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "As manufactured, unaltered. No certification standard is cited. Approved \"advanced neck and head\" devices: Leatt-Brace Moto Kart and Moto GPX, EVS Evolution Race Collar, Valhalla 360 Plus Device.",
        citation: { ...s102, section: "102.2, Neck Collar" },
        confidence: "high",
        notes: "Mandatory for this class. Not having it on, losing it, or it becoming loose while on track draws an immediate black flag.",
      },
    },
    "senior-masters": {
      neck_collar: {
        requirement: "recommended",
        materialOnlyAccepted: true,
        materialNote: "Not required for this class, but \"advanced neck and head support\" is highly recommended for drivers of all ages: Leatt-Brace Moto Kart and Moto GPX, EVS Evolution Race Collar, Valhalla 360 Plus Device.",
        citation: { ...s102, section: "102.2, Neck Collar" },
        confidence: "high",
      },
    },
  },
};

export const uspksRulesets: Ruleset[] = [uspksKarting];
