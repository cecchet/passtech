import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "Pikes Peak International Hill Climb (PPIHC) Rule Book",
  version: "2026 Rule Book, effective Dec 5, 2025",
  url: "http://www.ppihc.org",
};

const hillClimb: Ruleset = {
  id: "pikespeak-hillclimb",
  bodyId: "pikespeak",
  bodyName: "Pikes Peak International Hill Climb (PPIHC)",
  disciplineName: "Hill Climb",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "114 Required Safety Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2020", noExpiration: true },
        {
          standardId: "snell-sa2025",
          noExpiration: true,
          note: "Rule Book: 'Three years after helmets have been upgraded by Snell, competitors will be required to meet or exceed the new standards' — no specific date given, so not encoded as a hard cutoff here.",
        },
        { standardId: "sfi-31.2" },
        { standardId: "sfi-31.2a" },
        { standardId: "bs-6658-1985" },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "fia-8859-2024-abp", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "114.2.1" },
      confidence: "medium",
      notes:
        "No full-face requirement found — §114.2.2 explicitly allows an open-face helmet paired with goggles ('Helmets should be equipped with a face shield; if not, the use of goggles is required'), so helmet style is left to the driver's choice. Confidence is medium: read from a single copy of the rule book rather than cross-verified against a second source. Name/blood-type lettering on the helmet and safety-glass corrective lenses are also required by this rule but aren't modeled here.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the Rule Book, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "114.2.5" },
      confidence: "medium",
      notes: "Rule Book just requires an 'SFI/FIA approved' device with no specific spec number named. Go-kart 'donut' restraints are explicitly not approved.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-3.2a-1",
          validityYearsFromLabel: 10,
          note: "Acceptable only when paired with Nomex (or equivalent) long-sleeve fire-retardant underwear, unless the suit has 3+ layers.",
        },
        { standardId: "sfi-3.2a-5", validityYearsFromLabel: 10, note: "Recommended tier over 3.2A/1." },
        { standardId: "fia-8856-2000", validityYearsFromLabel: 10 },
        { standardId: "fia-8856-2018", validityYearsFromLabel: 10 },
      ],
      citation: { ...sourceDoc, section: "114.2.3" },
      confidence: "medium",
      notes: "Rule Book: 'as of 2025, all fire suits are not to exceed 10 years of age' — applied here as a 10-year cap measured from the date printed on the suit's label, across all accepted standards. The rule book text only names FIA 8856-2000, but FIA 8856-2018 (which superseded it) is also accepted in practice — confirmed by a Pikes Peak competitor; the rule book's own text is incomplete here.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      materialNote: "Rule Book: 'SFI approved flame-retardant ... (SFI 3.3/5), (FIA 8856-2000) gloves ... are required' — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "114.2.4" },
      confidence: "medium",
      notes: "The rule book text only names FIA 8856-2000, but FIA 8856-2018 is also accepted in practice — confirmed by a Pikes Peak competitor.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      materialNote: "Rule Book: 'SFI approved flame-retardant shoes (SFI 3.3/5), (FIA 8856-2000) ... are required.'",
      citation: { ...sourceDoc, section: "114.2.4" },
      confidence: "low",
      notes: "SFI 3.3/5 is unusual as a shoe-specific citation (it's normally the glove/apparel family spec) — transcribed as written from the rule book; the rule may intend the broader SFI 3.3 apparel family rather than a glove-only spec. Worth spot-checking against a current copy. The rule book text also only names FIA 8856-2000, but FIA 8856-2018 is also accepted in practice — confirmed by a Pikes Peak competitor.",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required if your driving suit is single- or double-layer (Nomex or equivalent long-sleeve fire-retardant underwear); not required with 3-or-more-layer suits unless the suit manufacturer specifies otherwise. Separately, socks worn with your shoes must be SFI 3.3/5 or FIA 8856-2000/2018 certified per §114.2.4 — not fully modeled here since this category covers body underwear, not socks specifically.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rule Book just says 'Nomex or equivalent long sleeved fire-retardant underwear' when required — no specific certification number cited for the underwear itself.",
      citation: { ...sourceDoc, section: "114.2.3" },
      confidence: "medium",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required in all open-cockpit/open-air vehicles, positioned per the restraint manufacturer's recommendation (§108, §114.2.7). Closed-cockpit cars must have arm restraints OR a window net instead (§114.2.6) — not both.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No specific certification standard cited by PPIHC for arm restraints — an SFI 3.3-rated device obviously qualifies.",
      citation: { ...sourceDoc, section: "108, 114.2.6-114.2.7" },
      confidence: "medium",
    },
  },
};

export const pikespeakRulesets: Ruleset[] = [hillClimb];
