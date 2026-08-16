import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "PHA Supplementary Regulations to the SCCA HillClimb and Time Trial Rules",
  version: "2026.1, March 2026",
  url: "https://pahillclimb.org/wp-content/uploads/2026/03/2026-Hillclimb-Supplementary-Regulations-Final.pdf",
};

const timeTrialHillclimb: Ruleset = {
  id: "pha-time-trial-hillclimb",
  bodyId: "pha",
  bodyName: "SCCA Time Trial — Pennsylvania Hillclimb Association (PHA)",
  disciplineName: "Time Trial / Hillclimb",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "9.20 Required Driver Safety Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "sfi-31.1a", noExpiration: true, note: "Open-face spec — see full-face requirement below; not usable except under the narrow legacy exemption." },
        { standardId: "sfi-31.2a", noExpiration: true },
      ],
      fullFaceRequirement: "required",
      fullFaceCondition:
        "PHA §9.20.B.1: 'Full face helmets for all drivers are required.' A narrow legacy exemption exists for SA2020 open-face helmets bought before 3/5/2022, paired with a DOT-approved windshield, through the end of the first full PHA season SA2025 full-face helmets are available — not modeled here since it's date/receipt-dependent and likely already lapsed; treat an open-face result as a strong signal to double-check with PHA tech.",
      citation: { ...sourceDoc, section: "9.20.B.1" },
      confidence: "high",
      notes: "Snell M-rated helmets are explicitly NOT allowed for PHA Time Trial/Hillclimb events (only allowed for HPDE-style events elsewhere, not modeled here).",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "9.20.B.2" },
      confidence: "high",
      notes: "PHA: 'H&NR devices do not time out irrespective of any stated expiration date, but they must be maintained in acceptable condition.'",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", note: "Underwear becomes required with this tier — see undergarment." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "fia-1986" },
        { standardId: "fia-8856-2000" },
      ],
      citation: { ...sourceDoc, section: "9.20.A" },
      confidence: "high",
      notes:
        "Rule text only names FIA 1986 Standard and FIA Standard 8856-2000 — FIA 8856-2018 is not explicitly listed here (unlike most other bodies in this app). Not adding it without confirmation from PHA, given this rulebook was read directly and doesn't mention it. One-piece suits strongly recommended, not mandatory.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "PHA: 'Gloves made of leather and/or accepted fire resistant material containing no holes' — no certification number required, plain material qualifies.",
      citation: { ...sourceDoc, section: "9.20.C" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "PHA: 'Shoes, with uppers of leather and/or nonflammable material that at a minimum cover the instep' — no certification number required. Separately, §9.20.D requires socks of accepted fire-resistant material — not modeled as its own category here since this app's undergarment category covers body underwear, not socks.",
      citation: { ...sourceDoc, section: "9.20.H" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required unless the driving suit itself carries an FIA 1986 Standard, FIA 8856-2000, or SFI 3-2A/5-or-higher (3.2A/10, /15, /20) label — in which case fire-resistant underwear becomes optional. Also: balaclavas (or a full fire-resistant helmet skirt) are required for drivers with beards/mustaches, and for open-face helmets generally — not separately modeled here.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "PHA just says 'underwear of fire resistant material' when required — no specific certification number cited.",
      citation: { ...sourceDoc, section: "9.20.A" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required on all open cars, including open Targa tops, sunroofs, and T-tops (§11). Closed-cockpit cars may use EITHER arm restraints OR a driver's-side window net instead (§9.27) — not both required. Worn per the restraint manufacturer's instructions, wrists/hands kept inside the bodywork/roll cage envelope.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No specific certification standard cited by PHA for the arm restraint itself (window nets, if used instead, must be SFI 27.1 — a vehicle item, not modeled here).",
      citation: { ...sourceDoc, section: "9.27, 11" },
      confidence: "high",
    },
  },
};

export const phaRulesets: Ruleset[] = [timeTrialHillclimb];
