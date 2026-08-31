import { Ruleset } from "../types";

// AKRA (American Kart Road-Racing Alliance) — fourth and last karting body in this pass, after
// NKA, SKUSA, and USPKS. Only DRIVER safety gear is modeled (see nka.ts for why car/rollover-
// protection categories are omitted entirely). Section 3.A ("Personal Safety Equipment") is the
// single, general (not class-specific) source for everything here — unlike the other three
// bodies, AKRA doesn't split neck-brace requirements by age/division; it splits by chassis
// configuration (sit-up vs. lay-down), so no `classes` are modeled for this ruleset.
const sourceDoc = {
  title: "2026 AKRA Road Race Tech Manual",
  version: "Version 2026.1",
  url: "https://akraracing.com/rules/",
};

const s3a = { ...sourceDoc, section: "Section 3.A, Personal Safety Equipment" };

const akraKarting: Ruleset = {
  id: "akra-karting",
  bodyId: "akra",
  bodyName: "AKRA (American Kart Road-Racing Alliance)",
  disciplineName: "Karting — Road Racing",
  disciplineGroup: "Karting",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sourceDoc],
  knownGaps: [
    "Chest/rib protector: not explicitly mandated in the sections reviewed, but a common requirement across karting bodies for younger/novice drivers — this app doesn't track this as its own category, so verify directly for your class if you're unsure.",
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018-abp", validityYearsFromLabel: 10 },
        {
          standardId: "snell-cmr2016",
          expiresOn: "2026-12-31",
          note: "Youth kart-specific rating. Snell certification tags don't print a manufacture or expiration date (unlike SFI/FIA), so this is computed as 10 years from the CMR2016 standard's own release year — the same convention already used for the other Snell generations above (e.g. K2020/SA2020 → 2030-12-31).",
        },
        { standardId: "snell-cms2016", expiresOn: "2026-12-31", note: "Youth kart-specific rating — see CMR2016 note." },
        { standardId: "snell-k2020", expiresOn: "2030-12-31" },
        { standardId: "snell-m2020d", expiresOn: "2030-12-31" },
        { standardId: "snell-m2020r", expiresOn: "2030-12-31" },
        { standardId: "snell-sa2020", expiresOn: "2030-12-31" },
        { standardId: "snell-k2025", expiresOn: "2035-12-31" },
        { standardId: "snell-m2025d", expiresOn: "2035-12-31" },
        { standardId: "snell-m2025r", expiresOn: "2035-12-31" },
        { standardId: "snell-sa2025", expiresOn: "2035-12-31" },
        { standardId: "sfi-24.1-2015", expiresOn: "2027-01-01" },
        { standardId: "sfi-31.1-2015", expiresOn: "2027-01-01" },
        { standardId: "sfi-41.1-2015", expiresOn: "2027-01-01" },
        { standardId: "sfi-24.1-2020", expiresOn: "2032-01-01" },
        { standardId: "sfi-31.1-2020", expiresOn: "2032-01-01" },
        { standardId: "sfi-41.1-2020", expiresOn: "2032-01-01" },
        { standardId: "sfi-24.1-2025", expiresOn: "2037-01-01" },
        { standardId: "sfi-31.1-2025", expiresOn: "2037-01-01" },
        { standardId: "sfi-41.1-2025", expiresOn: "2037-01-01" },
      ],
      fullFaceRequirement: "required",
      citation: { ...s3a, section: "Section 3.A.1, Head Gear" },
      confidence: "high",
      notes: "Full visor, integral with the helmet, is mandatory. Explicitly listed as no longer legal: FIA 8860-2010, Snell K/M/SA 2015, and SFI 24.1/31.1/41.1-2010 (all expired 1/1/2022) — omitted from the accepted list above rather than modeled as expired entries.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Mandatory if your hair extends appreciably below the helmet — a head sock or balaclava must be worn to contain it. Not required otherwise.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s3a, section: "Section 3.A.3, Driver Apparel" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: s3a,
      confidence: "high",
      notes: "Not addressed as its own category — most karts don't have the multi-point harness a HANS-style device tethers to. AKRA's own Neck Brace requirement (see that category) is the accepted form of neck protection here.",
    },
    neck_collar: {
      requirement: "conditional",
      condition: "Mandatory in all \"sit-up\" classes (the standard kart seating position) — chassis configurations that don't seat the driver this way (e.g. lay-down/enclosed enduro-style karts) may fall outside this rule; confirm against your specific class/chassis type.",
      materialOnlyAccepted: true,
      materialNote: "Collar-type, unaltered, designed for motorsports use. No certification standard is cited.",
      citation: { ...s3a, section: "Section 3.A.2, Neck Brace" },
      confidence: "high",
      notes: "Losing the neck brace during an event draws a black flag with an orange \"meatball\" circle — the driver must immediately pit, may replace the missing brace, and return to the session.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Full abrasion-proof driver's suit, OR a jacket (leather, vinyl, abrasion-resistant nylon, or equivalent) plus full-length pants — NOT a fire-resistance requirement the way car-racing firesuit rules are. No certification standard (e.g. CIK-FIA Level 2) is cited.",
      citation: { ...s3a, section: "Section 3.A.3, Driver Apparel" },
      confidence: "high",
      notes: "Loose clothing, bandanas, scarves, hoods, and loose belts are prohibited.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s3a, section: "Section 3.A.3, Driver Apparel" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s3a, section: "Section 3.A.3, Driver Apparel" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s3a, section: "Section 3.A.3, Driver Apparel" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: s3a,
      confidence: "medium",
      notes: "Not mentioned in the personal safety equipment section reviewed.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: s3a,
      confidence: "medium",
      notes: "Not mentioned anywhere in the tech manual — not a typical kart safety item given the open cockpit design.",
    },
    // hood_pins/spill_kit are car-group categories, unlike the driver-gear-only categories above
    // (see the file-header note on why car categories are otherwise omitted entirely for karting).
    // These two are newly tracked app-wide, so they're checked and recorded explicitly here even
    // though the answer for karting is a confident "not applicable."
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Section 4, Kart Types and Construction" },
      confidence: "high",
      notes: "AKRA karts (sit-up and laydown enduro/shifter classes alike) have no hood/engine cover — bodywork is a nose cone, side panels, and belly pans attached per the detailed bodywork rules in Section 4, with no mention of hood pins or a comparable fastener-security requirement.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Section 3.B.8, Fuel Systems" },
      confidence: "high",
      notes: "No onboard spill-kit requirement anywhere in the manual, and no adjacent catch-container/overflow rule either (unlike some other karting bodies) — the fuel system section covers puncture-resistant tanks and secure leak-proof closures but says nothing about spill containment or cleanup.",
    },
  },
};

export const akraRulesets: Ruleset[] = [akraKarting];
