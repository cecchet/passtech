import { CategoryRule, EquipmentCategory, SourceDocument } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

/**
 * SCCA Time Trials "Safety Level 2" driver-gear rules, shared by any club/series whose own
 * rules just say "meet SCCA Time Trial Safety Level 2/3" rather than restating equipment
 * requirements themselves (e.g. Appalachian HillClimb Series). Safety Level 3 adds only a
 * roll cage on top of Level 2 — no additional driver-gear items — so it's driver-PPE-identical
 * to Level 2 and doesn't need its own copy here (roll cages are out of this app's scope).
 *
 * A club with its OWN restated/superseding equipment rules (e.g. PHA, whose SUPPS explicitly
 * take precedence over the base SCCA Time Trial Rules) should NOT use this — write its own
 * CategoryRule set instead, since it may differ from this base (PHA's full-face rule is
 * stricter, for instance).
 */
export const SCCA_TT_LEVEL2_SOURCE: SourceDocument = {
  title: "SCCA Time Trials Full Safety Rules",
  version: "Safety Level 2",
  section: "IV.2 Safety Level 2 — 3. Driver Safety Gear",
  url: "https://timetrials.scca.com/pages/full-safety-rules",
};

export const SCCA_TT_LEVEL2_CATEGORIES: Partial<Record<EquipmentCategory, CategoryRule>> = {
  helmet: {
    requirement: "required",
    acceptedStandards: [
      { standardId: "snell-sa2025", noExpiration: true },
      { standardId: "snell-sa2020", noExpiration: true },
      { standardId: "snell-ea2016", noExpiration: true },
      { standardId: "snell-sa2015", noExpiration: true },
      { standardId: "sfi-31.1-2015", noExpiration: true },
      { standardId: "sfi-31.1-2020", noExpiration: true },
      { standardId: "fia-8859-2015", noExpiration: true },
      { standardId: "fia-8860-2010", noExpiration: true },
      { standardId: "fia-8860-2018", noExpiration: true },
      { standardId: "fia-8860-2018-abp", noExpiration: true },
      { standardId: "fia-8860-2024", noExpiration: true, note: "'8860-2010 or newer' per the rule text." },
      { standardId: "fia-8860-2024-abp", noExpiration: true },
    ],
    fullFaceRequirement: "conditional",
    fullFaceCondition:
      "Full face (with a shield) is required in any vehicle without a DOT-approved windshield or with less than a standard-size windshield (kit cars, sports racers, formula cars, Specials). A shield or goggles (not eyeglasses) are required in any other car without a full-size windshield too.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Rule text names only FIA 8859-2015 (not 2020/2024) but '8860-2010 or newer' for the 8860 family — transcribed literally even though it reads like an odd asymmetry.",
  },
  hnr: {
    requirement: "recommended",
    acceptedStandards: [
      { standardId: "sfi-38.1", noExpiration: true },
      { standardId: "fia-8858-2002", noExpiration: true },
      { standardId: "fia-8858-2010", noExpiration: true },
    ],
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "medium",
    notes: "Rule text only says a head-and-neck support system is 'highly recommended' where belts/seat are compatible — not a hard requirement, and no exact spec number is named (mapped to the usual SFI 38.1/FIA 8858 family).",
  },
  firesuit: {
    requirement: "required",
    acceptedStandards: [
      { standardId: "fia-1986" },
      { standardId: "fia-8856-2000" },
      { standardId: "fia-8856-2018" },
      { standardId: "sfi-3.2a-5" },
      { standardId: "sfi-3.2a-10" },
      { standardId: "sfi-3.2a-15" },
      { standardId: "sfi-3.2a-20" },
      { standardId: "sfi-3.2a-1", note: "May only be worn with fire-resistant underwear — see undergarment." },
    ],
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  gloves: {
    requirement: "required",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "'Gloves made of leather and/or accepted fire-resistant material containing no holes' — no certification number required.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  shoes: {
    requirement: "required",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote:
      "'Shoes, with uppers of leather and/or nonflammable material that, at a minimum, cover the instep' — no certification number required. Separately, socks of accepted fire-resistant material are required — not modeled as its own category here since this app's undergarment category covers body underwear, not socks. Balaclavas of fire-resistant material are also required for drivers with beards/mustaches — not modeled.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  undergarment: {
    requirement: "conditional",
    condition: "Required only if the driving suit itself carries an SFI 3-2A/1 label; suits rated FIA 1986/8856-2000/8856-2018 or SFI 3-2A/5-or-higher don't require it separately.",
    undergarmentTriggerStandards: ["sfi-3.2a-1"],
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "No specific certification number cited for the underwear itself.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  arm_restraint: {
    requirement: "conditional",
    condition: "HillClimb-specific rule: required in any open car; closed cars must have either a driver's-side window net OR arm restraints (not both).",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "No specific certification standard cited for the arm restraint itself.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "This is the HillClimb variant of the rule — the Time Attack/TrackSprint (track-event) variant of SCCA TT only 'highly recommends' a net/restraints rather than requiring them; not used here since this base is intended for HillClimb-style clubs.",
  },
};
