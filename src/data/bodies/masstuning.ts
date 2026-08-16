import { Ruleset } from "../types";

// MassTuning runs "TrackFest" — non-competitive HPDE track days at NHMS, Palmer, Thompson,
// Lime Rock, NJMP, Club Motorsports, Canaan, Monticello, and other Northeast circuits (60+ days/
// year per their listings). Confirmed via masstuning.com (redirects to their MotorsportReg hub,
// msreg.com/trackfest) and the actual signed tech-inspection/waiver form participants complete.
// Run groups are Novice/Intermediate/Advanced/Expert, but per that same tech form these govern
// passing rules and session timing only — there is no group-specific safety-equipment tier;
// the single equipment line below is the entire published requirement for every group.
const techForm = {
  title: "MassTuning TrackFest Tech Inspection, Waiver & Responsibility Form",
  url: "https://masstuning.com",
  section:
    "'PLEASE READ AND SIGN ENTIRELY!' checklist, item: 'Snell certified helmet, closed toe shoes and valid driver's license' (form is distributed per-event via each TrackFest's MotorsportReg registration page, e.g. msreg.com/trackfest listings)",
};

const trackfest: Ruleset = {
  id: "masstuning-trackfest",
  bodyId: "masstuning",
  bodyName: "MassTuning (TrackFest)",
  disciplineName: "HPDE Track Day (TrackFest)",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForm],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2010", noExpiration: true },
        { standardId: "snell-m2025d", noExpiration: true },
        { standardId: "snell-m2025r", noExpiration: true },
        { standardId: "snell-m2020d", noExpiration: true },
        { standardId: "snell-m2020r", noExpiration: true },
        { standardId: "snell-m2015", noExpiration: true },
        { standardId: "snell-m2010", noExpiration: true },
      ],
      citation: { ...techForm },
      confidence: "medium",
      notes:
        "The tech/waiver form's entire stated requirement is 'Snell certified helmet' — no generation/year, no SA-vs-M distinction, and no expiration window is given anywhere in MassTuning's public materials (unlike, e.g., NEQ which explicitly requires SA and excludes M). The accepted-standards list above is this app's own reasonable interpretation of 'Snell certified,' not something MassTuning itself enumerates — confidence is medium for that reason, though it is high that some current Snell certification is required. Optional helmet rental ($25/day) is offered at some events. Worth a direct spot-check/onsite confirmation if a borderline (older or M-rated) helmet is in play.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech/waiver form, which is the complete published safety-equipment requirement for TrackFest.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned. Consistent with TrackFest being a novice-friendly, lightly-equipped grassroots HPDE program ('This is not a race but an educational, high performance driving event').",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech/waiver form.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Tech form requires only 'closed toe shoes' — no fire-resistance material or certification requirement of any kind.",
      citation: { ...techForm },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned; no certified-suit requirement exists that would trigger a fire-resistant-underwear condition.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech/waiver form, including for convertibles/open cars.",
    },
  },
};

export const masstuningRulesets: Ruleset[] = [trackfest];
