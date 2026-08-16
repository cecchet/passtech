import { Ruleset } from "../types";

const faq = {
  title: "Hooked On Driving HPDE FAQ",
  url: "https://www.hookedondriving.com/faq/",
};

const policies = {
  title: "Hooked On Driving Important Policies & Forms",
  url: "https://www.hookedondriving.com/important-policies-forms/",
};

// HOD's run groups (Novice/Intermediate/Advanced, naming varies A/B/C/D by region) differ in
// coaching structure and passing rules but not in required safety equipment — confirmed via HOD's
// own run-groups page, which describes group-by-group driving privileges with no equipment
// distinctions. A separate "Time Trials" add-on program exists (Rulebook v26.1) but explicitly
// defers to "HOD's existing HPDE rules" for helmets/harnesses/roll cages rather than adding its
// own equipment requirements, so it isn't modeled as a separate ruleset here.
const hpde: Ruleset = {
  id: "hod-hpde",
  bodyId: "hookedondriving",
  bodyName: "Hooked on Driving (HOD)",
  disciplineName: "HPDE Track Day",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [faq, policies],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2020", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2015", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2010", validityYearsFromLabel: 10 },
        { standardId: "snell-sah2010", validityYearsFromLabel: 10 },
      ],
      citation: { ...faq, section: "FAQ: 'Can I wear my motorcycle helmet?'" },
      confidence: "high",
      notes:
        "'HOD requires auto racing helmets with a Snell Foundation SA rating that is within 10 years of the event date... A DOT rating does not qualify.' Any SA generation qualifies as long as it's within the 10-year window from its manufacture date — HOD does not restrict to only the most recent generations the way SCDA/PCA do. M-rated Snell helmets are explicitly treated by HOD's FAQ as motorcycle helmets and are NOT accepted ('If it says M, it is a motorcycle helmet') — unlike most other bodies in this app, which treat Snell M as a distinct valid auto-racing spec. No SFI, FIA, ECE, or BS alternative is mentioned anywhere in HOD's public materials, so none are listed as accepted here. No full-face requirement is stated; for open cars (e.g. Boxster) HOD requires 'some form of eye protection' and says 'an enclosed helmet with a visor is highly recommended' but does not mandate full-face — goggles or another form of eye protection would satisfy the letter of this rule.",
    },
    hnr: {
      requirement: "conditional",
      condition:
        "Mandatory only when the car is fitted with a 5- or 6-point competition harness (per HOD's equal-restraint policy, this then applies to both driver and passenger seats if either has one). Not required with a stock/factory 3-point seatbelt. HOD names specific accepted devices/brands: NecksGen, HANS, Schroth SHR Flex, Stand 21 (Ultimate, Hitech, and Club Series), Z Neck Tech (Zamp), and Simpson Hybrid S.",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002" },
        { standardId: "fia-8858-2010" },
      ],
      citation: { ...policies, section: "Head & Neck Restraint (HNR) policy" },
      confidence: "medium",
      notes:
        "HOD's policy page lists specific accepted device models/brands rather than a certification spec number; mapped here to the SFI 38.1 / FIA 8858 standards those named devices are certified under. Worth spot-checking whether HOD would also accept other SFI 38.1/FIA 8858-certified devices not on their named list.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes:
        "Not mentioned anywhere in HOD's FAQ, policies page, or Time Trials rulebook (which explicitly defers to 'HOD's existing HPDE rules' for helmets/harnesses/roll cages without adding a suit requirement). Consistent with HOD's HPDE program being novice-friendly and lightly equipped by design.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public FAQ, policies page, or Time Trials rulebook.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "medium",
      notes:
        "HOD's own FAQ and policies pages (searched directly for footwear/shoe mentions) do not state a footwear requirement. Some third-party aggregator summaries mention 'closed-toe shoes' as a general expectation for HOD events, but this was not found verbatim in HOD's official materials during this research pass — closed-toe/athletic shoes are standard track-day practice regardless, but it isn't confirmed here as an HOD-stated rule. Worth a direct spot-check with HOD or a regional waiver/registration form if precision matters.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public materials.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes:
        "Not mentioned. HOD's convertible/high-center-of-gravity (HCG) vehicle policy addresses rollover protection for the car itself, not a driver arm-restraint requirement.",
    },
  },
};

export const hookedOnDrivingRulesets: Ruleset[] = [hpde];
