import { Ruleset } from "../types";
import { SFI_3_3_IDS } from "../standards";

const sourceDoc = {
  title: "World Racing League Rules",
  version: "2026 Rules Version 2026.1.2",
  url: "https://www.racewrl.com/rules",
};

const endurance: Ruleset = {
  id: "wrl-endurance",
  bodyId: "wrl",
  bodyName: "World Racing League (WRL)",
  disciplineName: "Endurance Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "B.2 Personal Safety Gear; Appendix A.3.f Window Net" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "fia-8859-2024-abp", noExpiration: true },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "B.2.a" },
      confidence: "medium",
      notes:
        "Rulebook: 'Full-face with visor (face shield). No structural damage. Rated Snell SA/SAH-2015 or 2020 for drivers... Helmets meeting current FIA standards are permitted.' Two ambiguities: (1) the 'SAH' reference has no matching SAH2015/SAH2020 entries in this app's standards registry (only 'snell-sah2010' exists) — possibly a rulebook holdover/typo, flagged for the maintainer; (2) 'current FIA standards' isn't itemized, so the current FIA 8859 (auto racing helmet) generations are assumed — FIA 8860 (higher-spec) generations were not added since WRL doesn't reference them. Notably WRL does NOT list Snell SA2025, unlike most other bodies in this app — confirmed from the current 2026.1.2 rulebook text, not an oversight. Crew members (not drivers) may substitute an open-face helmet with a full-face balaclava and goggles when not directly fueling (D.3.d/e) — not applicable to driver equipment. Balaclava and eye protection requirements are not modeled since they aren't tracked categories in this app.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002" },
        { standardId: "fia-8858-2010" },
      ],
      citation: { ...sourceDoc, section: "B.2.f" },
      confidence: "medium",
      notes:
        "Rulebook: 'Drivers must wear a FIA 8858 or SFI 38.1 rated Head and Neck device and must carry an in-date certification.' No FIA generation year or SFI slash-level is specified. WRL does not itself state a recertification interval (unlike AER's stated 5-year rule) — 'in-date certification' is read here as deferring to the device's own manufacturer-issued recertification date, so no expiresOn/validityYearsFromLabel is encoded; this should be spot-checked.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        {
          standardId: "sfi-3.2a-1",
          note: "Only acceptable when paired with SFI 3.3-rated underwear, top and bottom (see undergarment category) — a bare SFI 3.2A/1 suit alone does not satisfy WRL's rule.",
        },
      ],
      materialOnlyAccepted: false,
      citation: { ...sourceDoc, section: "B.2.b" },
      confidence: "high",
      notes:
        "Rulebook: 'Fire retardant racing suit rated FIA 8856-2000 (or later), or SFI 3.2A/5, or higher. SFI 3.2A/1 suits may be worn with SFI 3.3 rated underwear top and bottom. The suit must be in good condition - no holes, oil stains, etc.' No suit age/expiration limit is stated by WRL.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.3-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by WRL's rule text (which only cites FIA 8856-2000) but assumed acceptable as the current FIA suit-family standard, matching this app's convention for other bodies with the same gap." },
      ],
      materialNote: "Rulebook: 'SFI 3.3/5 & FIA 8856/2000 rated gloves & shoes are required for all drivers' — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "B.2.d" },
      confidence: "medium",
      notes: "SFI 3.3/5 is an unusual glove-specific citation (SFI 3.3 normally covers the whole apparel family across several tiers) — transcribed as written; worth spot-checking against a current copy, same caveat noted for Pikes Peak's near-identical phrasing.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.3-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by WRL's rule text but assumed acceptable as the current FIA suit-family standard." },
      ],
      materialNote: "Same rule and citation as gloves — 'SFI 3.3/5 & FIA 8856/2000 rated gloves & shoes are required for all drivers.'",
      citation: { ...sourceDoc, section: "B.2.d" },
      confidence: "medium",
      notes:
        "SFI 3.3/5 as a shoe-specific citation is unusual for the same reason noted on gloves. Separately, §B.2.e requires socks rated SFI 3.3 or FIA 8856/2000 for drivers — not modeled since socks aren't a tracked category in this app; shown here as an adjacent requirement to check for.",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required (SFI 3.3-rated underwear, top and bottom) only if the driving suit is a single-layer SFI 3.2A/1 suit. Not required with SFI 3.2A/5-or-higher or FIA 8856-2000/2018-rated suits.",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId })),
      materialNote: "Rulebook just says 'SFI 3.3 rated underwear' when required — no specific tier named, but a certified item is required, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "B.2.b" },
      confidence: "high",
      notes: "Section B.2.e separately requires SFI 3.3 or FIA 8856/2000 rated socks for drivers — not modeled since socks aren't a tracked category in this app.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.f (Window Net)" },
      confidence: "high",
      notes:
        "Confirmed via full read of the current 2026.1.2 rulebook: WRL requires an SFI 27.1-rated window net (or a lexan/rigid quarter-window covering per Appx. A-4.b) on essentially all cars, with no arm-restraint alternative or requirement mentioned anywhere in the current text. This is a car-equipment rule, not driver PPE, so it isn't modeled as a category here. Note this is a change from WRL's older 2022.1.1 rulebook, which explicitly allowed arm restraints as an alternative to a window net and required them on open-top/convertible cars — that language has been removed from the current rulebook.",
    },
  },
};

export const wrlRulesets: Ruleset[] = [endurance];
