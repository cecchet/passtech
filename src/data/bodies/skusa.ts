import { Ruleset } from "../types";

// SKUSA (Superkarts! USA) — second karting body in this pass, after NKA. Like NKA, only DRIVER
// safety gear is modeled (see nka.ts for why car/rollover-protection categories are omitted
// entirely rather than marked "not addressed"). SKUSA's Section 106 ("Driver Equipment") is the
// single, well-organized source for everything here.
const sourceDoc = {
  title: "2026 SKUSA Rulebook",
  version: "Updated May 8, 2026",
  url: "https://www.superkartsusa.com/dmdocuments/2026-SKUSA-RuleBook.pdf",
};

const s106 = { ...sourceDoc, section: "106 Driver Equipment" };

// Chest protectors (SFI 20.1 or FIA 8870-2018, mandatory for Micro/Mini Swift or drivers 12 and
// under) and rib protectors (recommended, not required) are real SKUSA requirements but not
// modeled — this app has no chest-protector category (declined when scoping this pass).

const HELMET_STANDARDS = [
  // Snell
  { standardId: "snell-sa2020", expiresOn: "2030-12-31" },
  { standardId: "snell-m2020d", expiresOn: "2030-12-31" },
  { standardId: "snell-m2020r", expiresOn: "2030-12-31" },
  { standardId: "snell-k2020", expiresOn: "2030-12-31" },
  { standardId: "snell-sa2015", expiresOn: "2026-12-31" },
  { standardId: "snell-m2015", expiresOn: "2026-12-31" },
  {
    standardId: "snell-cmr2016",
    expiresOn: "2026-12-31",
    note: "Youth kart-specific rating. Snell certification tags don't print a manufacture or expiration date (unlike SFI/FIA), so this is computed as 10 years from the CMR2016 standard's own release year — the same convention already used for the other Snell generations above (e.g. SA2015 → 2026-12-31, SA2020 → 2030-12-31).",
  },
  { standardId: "snell-cms2016", expiresOn: "2026-12-31", note: "Youth kart-specific rating — see CMR2016 note." },
  // SFI — 24.1 is the youth-specific tier; 31.1 (SA-equivalent) and 41.1 (M-equivalent) are the adult tiers.
  { standardId: "sfi-24.1-2021", expiresOn: "2031-12-31" },
  { standardId: "sfi-24.1-2020", expiresOn: "2030-12-31" },
  { standardId: "sfi-31.1-2020", expiresOn: "2030-12-31" },
  { standardId: "sfi-41.1-2020", expiresOn: "2030-12-31" },
  // FIA
  { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018-abp", validityYearsFromLabel: 10 },
];

const skusaKarting: Ruleset = {
  id: "skusa-karting",
  bodyId: "skusa",
  bodyName: "SKUSA (SuperKarts! USA)",
  disciplineName: "Karting — Sprint",
  disciplineGroup: "Karting",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sourceDoc],
  knownGaps: [
    "Chest protector: SFI 20.1-rated device (or FIA 8870-2018 homologated) required for Micro/Mini Swift drivers, or any driver 12 and under — this app doesn't track this as its own category.",
  ],
  classes: [
    { id: "junior", label: "Junior classes (S5, Micro/Mini Swift, X30 Junior, KA100 Junior)" },
    { id: "senior", label: "Senior classes (Pro/Master Shifter, X30 Senior/Master, KA100 Senior/Master)" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: HELMET_STANDARDS,
      citation: s106,
      confidence: "high",
      notes:
        "Rule text: \"Although the youth helmet standard does not specify a precise age range, the helmets are intended for children; adult drivers should select a helmet meeting one of the other standards.\" Equipment must be in good condition, free of defects/holes/cracks/frays.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required only if hair would otherwise be exposed outside the helmet — a head sock (balaclava) or some other method must be used to fully restrain it.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited — any head sock/balaclava that fully contains the hair satisfies this.",
      citation: { ...sourceDoc, section: "106.9, Long hair" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: s106,
      confidence: "high",
      notes: "Not addressed as its own category — most karts don't have the multi-point harness a HANS-style device tethers to. SKUSA's own Neck Brace requirement (see that category) is the accepted form of neck protection here.",
    },
    neck_collar: {
      requirement: "conditional",
      condition: "Mandatory for Junior classes (S5, Micro Swift, Mini Swift, X30 Junior, KA100 Junior); optional for Senior classes (Pro Shifter, Master Shifter, X30 Senior, X30 Master, KA100 Senior, KA100 Master). Select a class to see which applies to you.",
      materialOnlyAccepted: true,
      materialNote: "Must be manufactured for racing and include the foam insert as originally designed — a removed or modified foam insert is non-compliant. No certification standard is cited yet (SFI-approved neck braces will become mandatory once approved, per SKUSA's rule text, at a future date TBD). The Leatt Neck Brace and Valhalla 360 are specifically named as acceptable alternatives to a standard neck brace.",
      citation: { ...sourceDoc, section: "106.11-106.12, Neck Brace" },
      confidence: "high",
      notes: "Loss or lack of a neck brace on course, in a class where it's mandatory, draws a black flag.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [{ standardId: "cik-level-2" }],
      citation: { ...sourceDoc, section: "106.6, Driving Suits" },
      confidence: "high",
      notes:
        "Must be manufactured for kart racing and meet current CIK-FIA Level 2 — this is primarily an abrasion/tear-resistance construction spec, not a fire-resistance spec the way car-racing firesuit standards (FIA 8856, SFI 3.2A) are. A separate jacket-and-pants combination is explicitly NOT permitted (\"Jacket and jeans are not permitted\") — unlike most car-racing bodies, no plain-material fallback exists here. Suit must fully cover the leg and ankle in the seated driving position.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Must be manufactured for racing, with racing-related grip enhancement and a degree of abrasion resistance. No certification standard is cited.",
      citation: { ...sourceDoc, section: "106.3, Gloves" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Must be shoes manufactured for racing — no portion of leg or ankle may be exposed in the driving position. No certification standard is cited.",
      citation: { ...sourceDoc, section: "106.9, Footwear" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: s106,
      confidence: "medium",
      notes: "Not mentioned in the driver equipment section reviewed.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: s106,
      confidence: "medium",
      notes: "Not mentioned in the driver equipment section reviewed.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: s106,
      confidence: "medium",
      notes: "Not mentioned anywhere in the rulebook — not a typical kart safety item given the open cockpit design.",
    },
    // hood_pins/spill_kit are car-group categories, unlike the driver-gear-only categories above
    // (see the file-header note on why car categories are otherwise omitted entirely for karting).
    // These two are newly tracked app-wide, so they're checked and recorded explicitly here even
    // though the answer for karting is a confident "not applicable."
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "303.5, Bumpers and Bodywork" },
      confidence: "high",
      notes: "SKUSA karts have no hood/engine cover — bodywork is CIK/SKUSA-approved side pods, nose, and driver fairing secured with homologated mounting hardware (including Push Back Bumper clamps for the nose). The rulebook is detailed about bodywork attachment and never uses \"hood pin\" or an equivalent fastener-security requirement.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "307.7, Fluid Capture" },
      confidence: "medium",
      notes: "No requirement for a driver-carried spill kit (absorbent material) anywhere in the rulebook. SKUSA does require \"a functional catch tank/container...on the fuel tank and radiator for overflow\" (307.7) — a narrower, built-in overflow-catch requirement rather than a portable absorbent spill-cleanup kit, so it isn't modeled as satisfying this category.",
    },
  },
  classOverrides: {
    junior: {
      neck_collar: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "Must be manufactured for racing and include the foam insert as originally designed — a removed or modified foam insert is non-compliant. The Leatt Neck Brace and Valhalla 360 are specifically named as acceptable alternatives.",
        citation: { ...sourceDoc, section: "106.11, Neck Brace" },
        confidence: "high",
        notes: "Mandatory for this class. Loss or lack of it on course draws a black flag.",
      },
    },
    senior: {
      neck_collar: {
        requirement: "recommended",
        materialOnlyAccepted: true,
        materialNote: "Not mandatory for this class, but if worn, must be manufactured for racing with the foam insert intact — the same construction standard as the Junior-class requirement.",
        citation: { ...sourceDoc, section: "106.11-106.12, Neck Brace" },
        confidence: "high",
      },
    },
  },
};

export const skusaRulesets: Ruleset[] = [skusaKarting];
