import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

// ============================================================================================
// IMPORTANT SCOPE FLAG — READ BEFORE INTEGRATING
// This body file was researched as part of a batch of three assumed-HPDE (non-competitive) New
// England track day organizers. Research shows Northeast GT (NEGT, "Real Clean Racing",
// northeast-gt.com) is NOT a non-competitive HPDE/lapping club — it is a genuine competitive
// wheel-to-wheel racing series (the "NEGT Cup": Time Attack, Sprint Racing, and multi-hour
// Endurance racing), gated by holding a competition license or completing NEGT's own "GT Race
// School." Cars must be "fully prepared for wheel-to-wheel racing" (roll cage, fire system,
// master switch, in-date harnesses, racing seat, window net). MassTuning (see masstuning.ts, a
// separate org in this same batch) runs the actual non-competitive HPDE practice/lapping days at
// the same tracks and is explicitly where NEGT drivers go to "meet, practice, and test" outside
// of race weekends.
// The equipment rules below are therefore modeled honestly as what NEGT actually requires
// (race-tier gear), not as HPDE-tier gear — flagged here so the integrator can decide whether
// this belongs in an "HPDE" batch at all, or should be relabeled/held for a competitive-racing
// batch instead.
// Sourcing is also weaker than the other two files in this batch: the official "Northeast GT 2026
// Rulebook 2.0.0" PDF (linked from northeast-gt.com/rules-and-forms/) is an image-based/scanned
// PDF whose text layer could not be reliably extracted during this research pass, so no exact
// section numbers could be confirmed. The equipment summary below instead comes from the
// "Safety Gear" section of NEGT's own event registration listing (quoted verbatim), which is
// presumably drawn from that same rulebook but could not be cross-checked against it directly.
// Recommend a direct spot-check of the rulebook PDF (e.g. via OCR) before treating this file as
// final.
// ============================================================================================

const eventListing = {
  title: "Northeast GT — event registration listing, \"Safety Gear\" section",
  url: "https://www.motorsportreg.com/events/northeast-gt-race-1-2-school-thompson-speedway-motorsports-park-725382",
};

const rulebook = {
  title: "Northeast GT Rulebook",
  version: "2.0.0 (Feb 2026)",
  url: "https://www.northeast-gt.com/rules-and-forms/",
  section: "Driver & crew safety gear (exact section number unconfirmed — see file-level note; source PDF is image-based and could not be reliably parsed)",
};

const raceGear: Ruleset = {
  id: "northeastgt-race",
  bodyId: "northeastgt",
  bodyName: "Northeast GT (NEGT / \"Real Clean Racing\")",
  disciplineName: "Wheel-to-Wheel Racing — Time Attack / Sprint / Endurance (NEGT Cup)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [eventListing, rulebook],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true, note: "Event listing: 'SA 2015 or newer helmet (2010 for crew only), FIA or SFI rated.' Crew (e.g. fueling crew) minimum is Snell 2010; this app models the driver, not crew." },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true, note: "'FIA or SFI rated' offered as an alternative to Snell SA in the same sentence; exact FIA/SFI generations accepted are not itemized by NEGT, so current generations are listed here as a best-effort mapping." },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "sfi-31.1-2015", noExpiration: true },
        { standardId: "sfi-31.1-2020", noExpiration: true },
        { standardId: "sfi-41.1-2015", noExpiration: true },
        { standardId: "sfi-41.1-2020", noExpiration: true },
      ],
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
      notes:
        "SEE FILE-LEVEL NOTE AT TOP: this is a competitive wheel-to-wheel racing org, not an HPDE club. Requirement itself (some current Snell SA / FIA / SFI helmet) is reasonably confident; the exact accepted-standards list is this app's interpretation of a short marketing-page summary, not a verbatim enumeration from the rulebook — spot-check recommended.",
    },
    balaclava: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
      notes:
        "Event listing: 'HNR for drivers and balaclava (required for fueling crew, recommended for all).' Mandatory only for fueling crew (out of scope for this app, which models the driver); recommended, not required, for drivers.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
      notes:
        "Event listing: 'HNR for drivers and balaclava (required for fueling crew, recommended for all).' HNR (head-and-neck restraint) is stated as required for drivers; no specific device brand or spec number is named, so the standard SFI 38.1 / FIA 8858 devices are listed as a best-effort mapping.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-1" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
      ],
      materialNote: "Event listing just says 'fire suit... FIA or SFI rated' with no specific spec or slash-level named.",
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Event listing just says 'gloves... FIA or SFI rated' with no specific spec or slash-level named.",
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Event listing just says 'shoes... FIA or SFI rated' with no specific spec or slash-level named.",
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "low",
      notes:
        "Not mentioned in the sourcing we could access (the event-listing 'Safety Gear' summary). The full rulebook PDF is image-based and could not be reliably parsed during this research pass, so this may be an incomplete picture rather than a confirmed absence — a wheel-to-wheel series requiring FIA/SFI-rated suits often also addresses fire-resistant underwear as a suit-rating-dependent condition (see e.g. this app's SCCA GCR or NEHA competitive rulesets for the typical pattern). Spot-check the rulebook directly before trusting this as 'not required.'",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "low",
      notes:
        "Not mentioned in the sourcing we could access. NEGT cars are described as fully caged wheel-to-wheel race cars with window nets, which typically substitutes for a driver arm-restraint requirement in closed-cockpit racing — but this substitution is inferred, not confirmed in NEGT's own text. The full rulebook PDF could not be reliably parsed during this research pass; spot-check directly before trusting this as 'not required.'",
    },
  },
};

export const northeastGTRulesets: Ruleset[] = [raceGear];
