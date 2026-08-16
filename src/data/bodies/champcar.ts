import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, SFI_3_3_IDS } from "../standards";

const sourceDoc = {
  title: "ChampCar Endurance Series — Basic Club & Competition Rules (BCCR)",
  version: "2026 BCCR v1.4 (updated 12/17/2025)",
  url: "https://champcar.org/web/pdf/2026_BCCR/2026_BCCR_V1_4.pdf",
};

const endurance: Ruleset = {
  id: "champcar-endurance",
  bodyId: "champcar",
  bodyName: "ChampCar Endurance Series",
  disciplineName: "Endurance Road Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "3.10-3.12 Driver Safety Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", validityYearsFromLabel: 11 },
        { standardId: "snell-sa2020", validityYearsFromLabel: 11 },
        { standardId: "snell-sa2025", validityYearsFromLabel: 11 },
        {
          standardId: "fia-8859-2015",
          validityYearsFromLabel: 11,
          note: "BCCR §3.10.1 just says '...or FIA certification is required' without naming an exact spec number. Inferred here as the FIA 8859 full-face road-racing helmet family; not confirmed against an exact FIA spec number in the rulebook text — flag for spot-check.",
        },
        { standardId: "fia-8859-2020", validityYearsFromLabel: 11, note: "Same inference as fia-8859-2015 above." },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 11, note: "Same inference as fia-8859-2015 above." },
        { standardId: "fia-8859-2024-abp", validityYearsFromLabel: 11, note: "Same inference as fia-8859-2015 above." },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "3.10.1-3.10.2" },
      confidence: "medium",
      notes:
        "Rule text: 'An undamaged full-face helmet, displaying Snell Type SA2015, SA2020, SA2025, or FIA certification is required... All helmets expire 11 years after the date of certification.' Snell Type M (motorcycle) and other non-SA helmets explicitly barred as not fire-rated. Altered/counterfeit Snell stickers result in an event ban. An annual ChampCar helmet inspection decal is also required (§3.13.2) but isn't modeled here. Confidence is medium because the FIA helmet standard/spec number isn't named explicitly.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-38.1",
          validityYearsFromLabel: 5,
          note: "BCCR §3.11.2: 'Devices must be recertified every 5 years per SFI 38.1.'",
        },
        {
          standardId: "fia-8858-2010",
          noExpiration: true,
          note: "BCCR §3.11.3: 'FIA devices do not require recertification; however, FIA guidance per Standard 8858-2010 must be followed.'",
        },
      ],
      citation: { ...sourceDoc, section: "3.11" },
      confidence: "high",
      notes: "An undamaged FIA and/or SFI-approved racing neck restraint system is mandatory for every driver.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", noExpiration: true },
        {
          standardId: "sfi-3.2a-3",
          noExpiration: true,
          note: "NOT YET IN REGISTRY — cited verbatim by ChampCar as a single-layer tier ('SFI 3.2/A1 or 3.2/A3'). Flagged for reconciliation; the standards.ts registry currently only has SFI 3-2A tiers /1, /5, /10, /15, /20.",
        },
        { standardId: "sfi-3.2a-5", noExpiration: true },
        { standardId: "sfi-3.2a-10", noExpiration: true },
        { standardId: "sfi-3.2a-15", noExpiration: true },
        { standardId: "sfi-3.2a-20", noExpiration: true },
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "3.12.2" },
      confidence: "high",
      notes:
        "Rule text (§3.12.2.1-2): 'An FIA and/or SFI-certified racing suit is required. All driver suits possessing a valid FIA and/or SFI certification shall be allowed, regardless of the date of certification or manufacture' — i.e. suits genuinely never expire under ChampCar rules, unlike most other bodies. See undergarment category for the single- vs multi-layer condition, and the flagged SFI 3.2A/3 tier above.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId, noExpiration: true })).concat([
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ]),
      materialNote:
        "Rule text (§3.12.3.1-2): 'Fire-retardant FIA and/or SFI-certified gloves, socks, and shoes are required... shall be allowed, regardless of the date of certification or manufacture.' No specific tier/spec number is named, but a certified item is required.",
      citation: { ...sourceDoc, section: "3.12.3" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId, noExpiration: true })).concat([
        { standardId: "fia-8856-2000", noExpiration: true },
        { standardId: "fia-8856-2018", noExpiration: true },
      ]),
      materialNote:
        "Same sentence as gloves (§3.12.3.1): 'Fire-retardant FIA and/or SFI-certified gloves, socks, and shoes are required,' valid regardless of certification/manufacture date. Socks are also required by this rule but are not modeled as a separate category in this app.",
      citation: { ...sourceDoc, section: "3.12.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required only when wearing a single-layer SFI 3.2/A1 or 3.2/A3 suit — fire-retardant SFI- or FIA-certified undergarments are then mandatory. Multilayer suits rated SFI 3.2/A5 or higher are highly recommended and may be worn without undergarments.",
      undergarmentTriggerStandards: ["sfi-3.2a-1", "sfi-3.2a-3"],
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Must be a certified FIA- or SFI-rated undergarment, not just fire-resistant material, when required. No expiration is stated specifically for undergarments — the 'regardless of date' language in §3.12.2.2 is scoped to 'driver suits,' not explicitly extended to undergarments, so no expiration field is asserted here.",
      citation: { ...sourceDoc, section: "3.12.2.3" },
      confidence: "medium",
      notes: "Confidence is medium specifically on the expiration question — the requirement/condition text itself is unambiguous.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Roof nets OR SFI-certified arm restraints are required in all open (convertible) cars and/or cars with t-tops or sunroof openings (§3.5.2). Drivers of such cars without a roof net must pass an arm-extension test at pit-out confirming their hands don't extend above the roll cage 'halo's' lowest bar (§3.5.2.2) — failing or skipping it draws a penalty.",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-3.3-1",
          validityYearsFromLabel: 4,
          note: "BCCR §3.5.2.1: 'SFI restraints list a year of manufacture, and ChampCar will accept them until December 31st, four years from that year.' Modeled here as an approximate 4-year validity window from the label year; the real cutoff is always Dec 31 regardless of the exact manufacture month.",
        },
        { standardId: "sfi-3.3-5", validityYearsFromLabel: 4, note: "Same Dec-31/4-year rule as sfi-3.3-1 above." },
        { standardId: "sfi-3.3-10", validityYearsFromLabel: 4, note: "Same Dec-31/4-year rule as sfi-3.3-1 above." },
        { standardId: "sfi-3.3-20", validityYearsFromLabel: 4, note: "Same Dec-31/4-year rule as sfi-3.3-1 above." },
        {
          standardId: "fia-8856-2000",
          note: "BCCR §3.5.2.1: FIA-labeled restraints 'expire on December 31st of the year of expiration sewn into the item' — check the label directly; not modeled here as a fixed year offset.",
        },
        { standardId: "fia-8856-2018", note: "Same labeled-expiration rule as fia-8856-2000 above." },
      ],
      citation: { ...sourceDoc, section: "3.5.1-3.5.2" },
      confidence: "high",
      notes:
        "Separately, an SFI-approved window net mounted to the cage is mandatory in ALL competition cars regardless of body style (§3.5.1) — window nets aren't one of this app's seven tracked categories, so that blanket requirement isn't modeled here; it exists independently of the conditional arm-restraint/roof-net requirement above. materialOnlyAccepted is false because the rule explicitly requires an SFI- or FIA-certified item, not plain material.",
    },
  },
};

export const champcarRulesets: Ruleset[] = [endurance];
