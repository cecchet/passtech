import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, SFI_3_3_IDS } from "../standards";

const sourceDoc = {
  title: "American Endurance Racing Rulebook",
  version: "Current online rulebook (verified Aug 2026)",
  url: "https://race.americanenduranceracing.com/rulebook",
};

const endurance: Ruleset = {
  id: "aer-endurance",
  bodyId: "aer",
  bodyName: "American Endurance Racing (AER)",
  disciplineName: "Endurance Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "1.4-1.6 Driver Equipment; 2.5.6 Arm Restraints" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true, note: "Rulebook says 'SA2015 or later' — later Snell generations (SA2020, SA2025) are assumed included under 'or later.'" },
        {
          standardId: "fia-8860-2004",
          noExpiration: true,
          note: "Rulebook cites 'FIA 8860-2004' by name — this exact generation is NOT currently in this app's standards registry (which has FIA 8860-2010/2018/2018-ABP/2024/2024-ABP but not the original 2004 issue). Flagged for the maintainer to add or map to the nearest registered generation.",
        },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "1.4.4" },
      confidence: "high",
      notes:
        "Rulebook: 'A full-face helmet with a rating of SA2015 or later, or FIA 8860-2004. No open-face helmets will be allowed under any circumstances.' No stated expiration/sunset for the helmet rating itself.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required for any driver with hair or facial hair protruding from the helmet.",
      materialOnlyAccepted: false,
      acceptedStandards: [...SFI_3_3_IDS.map((standardId) => ({ standardId })), { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018", note: "Not explicitly named by AER's rule text (which only cites FIA 8856-2000), but assumed acceptable as the current FIA suit-family standard, matching this app's convention for other AER categories with the same gap." }],
      materialNote: "Rulebook §1.4.3: 'SFI 3.3 or FIA 8856-2000 or better' — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "1.4.3" },
      confidence: "high",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Rulebook: recertified every 5 years by the manufacturer; if a device is dual-certified by both FIA and SFI, AER requires the SFI 5-year recertification specifically." },
        { standardId: "fia-8858-2010", validityYearsFromLabel: 5 },
      ],
      citation: { ...sourceDoc, section: "1.5" },
      confidence: "high",
      notes:
        "Rulebook: 'Head and neck restraint, with a rating of SFI 38.1 or FIA 8858-2010 or better' (older FIA 8858-2002 not named, so not included here). Head and neck restraints may be shared among teammates (unusual — most bodies require personal equipment); not modeled since this app tracks per-item compliance, not sharing policy. No driver is allowed on track for qualifying or racing without a head and neck restraint.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by AER's rule text (which only cites FIA 8856-2000), but the superseding FIA 8856-2018 standard is assumed acceptable in practice, matching this app's convention for other bodies with the same gap." },
        {
          standardId: "sfi-3.2a-1",
          note: "Only acceptable when paired with an FIA 8856-2000-rated or SFI 3.3-approved base layer (see undergarment category) — a bare SFI 3.2A/1 suit alone does not satisfy AER's rule.",
        },
      ],
      materialOnlyAccepted: false,
      citation: { ...sourceDoc, section: "1.4.1" },
      confidence: "high",
      notes:
        "Rulebook: driving suit must be 'SFI 3.2A/5 or FIA 8856-2000' OR 'SFI 3.2A/1 with FIA 8856-2000 or SFI 3.3 approved base layer.' No suit age/expiration limit is stated — only that it 'must be in good condition (no rips or tears, zippers operating properly, etc.).'",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Shoes, socks and gloves, all to be rated at SFI 3.3 or FIA 8856-2000 or better' — no specific SFI 3.3 tier named, and no plain-material allowance (must be a certified item).",
      citation: { ...sourceDoc, section: "1.4.2" },
      confidence: "high",
      notes: "Gear 'must also be in good condition' — no separate age/expiration limit stated.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same rule and citation as gloves — SFI 3.3 or FIA 8856-2000 or better, no plain-material allowance.",
      citation: { ...sourceDoc, section: "1.4.2" },
      confidence: "high",
      notes:
        "The same §1.4.2 sentence also requires socks rated SFI 3.3 or FIA 8856-2000 or better ('Shoes, socks and gloves...') — not modeled separately since socks aren't one of this app's tracked categories; shown here as an adjacent requirement to check for.",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required (fire-resistant base layer, top and bottom) only if the driving suit is a single-layer SFI 3.2A/1 suit. Not required if the suit is rated SFI 3.2A/5 or FIA 8856-2000 or higher.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: false,
      acceptedStandards: [
        ...SFI_3_3_IDS.map((standardId) => ({ standardId })),
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by AER's rule text but assumed acceptable as the current FIA suit-family standard." },
      ],
      materialNote: "Rulebook: base layer must be 'FIA 8856-2000 or SFI 3.3 approved' — a certified base layer, not just any fire-resistant material.",
      citation: { ...sourceDoc, section: "1.4.1" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for any car with no roof or a convertible/removable roof. Not required if the car has a positively fastened hardtop.",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId })),
      materialNote: "Rulebook: 'required to wear arm restraints that meet the SFI 3.3 specification' — no tier named, and a certified item is required (not just fire-resistant material).",
      citation: { ...sourceDoc, section: "2.5.6" },
      confidence: "high",
    },
  },
};

export const aerRulesets: Ruleset[] = [endurance];
