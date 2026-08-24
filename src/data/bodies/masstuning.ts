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
    balaclava: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the tech/waiver form, just not yet re-checked.",
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
    socks: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned in the tech form's equipment checklist ('Snell certified helmet, closed toe shoes and valid driver's license' is the entire published requirement).",
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

    // Car safety gear
    seat: {
      requirement: "not_addressed",
      materialOnlyAccepted: true,
      materialNote:
        "No seat construction or certification requirement of any kind. The tech form's 10-item checklist — the entire published safety-equipment requirement for every TrackFest run group (Novice/Intermediate/Advanced/Expert) — never mentions seat type, construction, or certification; the only checklist line containing the word 'seat' is 'Seat belts or appropriate aftermarket harnesses must be secured correctly' (belts_harness), which is about the belts, not the seat itself. A stock/OEM seat is therefore accepted for every run group.",
      citation: { ...techForm },
      confidence: "high",
      notes:
        "Re-verified directly against the cached tech form PDF (rulebooks/masstuning-trackfest-tech-form.pdf) for this pass — same 10-item checklist as before, re-read in full: 'All loose items must be removed...', 'Windows must be able to be lowered completely on both sides', 'Seat belts or appropriate aftermarket harnesses must be secured correctly', 'Battery must be securely tied down...', 'Brake pads, fluid and lights...', 'Tires must be in good condition...', 'Lug nuts must all be present...', 'Steering and suspension components must not exhibit play', 'Fluids must be filled to minimum levels...', 'Snell certified helmet, closed toe shoes and valid driver's license'. No seat item exists, and nothing is said about sliders/rails vs. a fixed mount either. Consistent with TrackFest being a member's-own-car, run-what-you-brung HPDE program with no roll-cage/harness-tier equipment requirement.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "The checklist item reads 'Seat belts or appropriate aftermarket harnesses must be secured correctly' — stock/OEM seat belts are explicitly accepted as an alternative to an aftermarket harness. No certification standard (SFI/FIA), no expiration window, and no minimum harness spec (e.g. point count) is named.",
      citation: {
        ...techForm,
        section:
          "'PLEASE READ AND SIGN ENTIRELY!' checklist, item: 'Seat belts or appropriate aftermarket harnesses must be secured correctly'",
      },
      confidence: "high",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes:
        "Full document search of the tech/waiver form's 10-item checklist (verbatim, re-fetched from the current TrackFest Tech Form PDF linked off individual MotorsportReg event listings) found no mention of a window net requirement, and no mention of arm restraints either — so there's no interchangeable-alternative relationship to model here (unlike bodies such as PHA where the two trade off). The checklist's only window-related item is 'Windows must be able to be lowered completely on both sides' — a window-lowering/emergency-egress requirement, distinct from a window net (see the same note under window_breaker). Consistent with TrackFest being a non-competitive, run-what-you-brung HPDE program with no roll-cage/harness-tier equipment requirement.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech form's 10-item checklist — no extinguisher requirement, recommendation, size, or rating is stated.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned. Consistent with TrackFest being a novice-friendly, run-what-you-brung HPDE program with no onboard fire-suppression-system requirement.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned — no fuel cell/tank requirement of any kind; stock/OEM fuel tanks are unaddressed rather than explicitly approved.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned. The checklist separately requires 'Windows must be able to be lowered completely on both sides' — a window-lowering requirement, distinct from a window net/breaker or seatbelt-cutter tool, which isn't addressed.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned. The checklist separately requires 'Battery must be securely tied down with correct hardware' — a tie-down requirement, distinct from a kill switch/master battery cutoff, which isn't addressed.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech form's 10-item checklist.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech form's 10-item checklist.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech form's 10-item checklist.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...techForm },
      confidence: "high",
      notes: "Not mentioned anywhere in the tech form's 10-item checklist.",
    },
  },
};

export const masstuningRulesets: Ruleset[] = [trackfest];
