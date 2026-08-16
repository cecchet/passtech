import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

// "NEQ" = Northeast Chapter of the Audi Club of North America (ACNA), historically named for its
// "North East Quattro" roots and still branded "NEQ" (neqclub.org). It runs non-competitive HPDE
// (High Performance Driver Education / "high speed education") days at Lime Rock Park, Watkins
// Glen, NJMP, and Mont Tremblant — open to all makes, not just Audis. Confirmed via neqclub.org
// and its own downloadable tech-inspection paperwork (see sourceDocuments).
const techForms = {
  title: "NEQ Pre-Event Tech Inspection / Event Tech Confirmation / Responsibility Statement",
  version: "Revision 2026.1",
  url: "https://www.neqclub.org/tech-forms/",
};

const helmetsPage = {
  title: "NEQ — Helmets",
  url: "https://www.neqclub.org/helmets/",
};

const clothingPage = {
  title: "NEQ — Clothing",
  url: "https://www.neqclub.org/clothing/",
};

const openTopPage = {
  title: "NEQ — Open Top Cars / Convertibles",
  url: "https://www.neqclub.org/open-top-cars/",
};

// NEQ does not run tiered run groups with different equipment (their "non-solo" vs "solo" split is
// about driving privileges/experience, confirmed via the vehicle-requirements page, not gear) — a
// single ruleset covers all participants.
const hpde: Ruleset = {
  id: "neq-hpde",
  bodyId: "neq",
  bodyName: "NEQ (Audi Club North America — Northeast Chapter)",
  disciplineName: "HPDE / Driver Education (High-Speed Events)",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForms, helmetsPage, clothingPage, openTopPage],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true, note: "NEQ: 'Your helmet MUST say on it: SA2015 or SA2020.' No stated expiration beyond generation." },
        { standardId: "snell-sa2020", noExpiration: true },
      ],
      citation: { ...helmetsPage, section: "Helmet certification requirements" },
      confidence: "high",
      notes:
        "M-rated (motorcycle) Snell helmets are explicitly NOT accepted, even though they are Snell-certified: 'The primary difference between SA (Special Application) and M (Motorcycle) helmets are a Nomex (fire resistant) lining... M rated helmets are not allowed.' Not required at NEQ's separate winter (frozen-lake) driving schools. Full-face helmets (or effective eye protection with an open-face helmet) are only 'strongly recommended,' not mandated, for open-top cars/convertibles driven with the top down (see Open Top Cars page) — not modeled as fullFaceRequirement since it isn't stated as compulsory.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes: "No HANS/HNR requirement or mention found anywhere across NEQ's tech forms, helmets page, clothing page, or open-top-cars page.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "'At all driver education events, long sleeved cotton shirts and pants must be worn for safety reasons.' Plain natural-fiber clothing, not a certified racing suit — no SFI/FIA-rated suit is required or even offered as an alternative anywhere in NEQ's materials.",
      citation: { ...clothingPage, section: "Clothing requirements" },
      confidence: "high",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...clothingPage },
      confidence: "high",
      notes: "Not mentioned in NEQ's clothing page, tech forms, or anywhere else reviewed.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "'Light weight, smooth-soled footwear with socks is also required.' Sneakers are fine unless soles extend beyond the sides of the feet (reduces pedal feel). 'Open shoes will not be allowed.' The onsite Event Tech Confirmation form simply checks for 'closed toe shoes' — no fire-resistance material or certification requirement of any kind.",
      citation: { ...clothingPage, section: "Clothing requirements" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...clothingPage },
      confidence: "high",
      notes: "Not mentioned; consistent with no certified-suit requirement at this org (no suit rating exists that would trigger a fire-resistant-underwear condition).",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Applies to open-top cars/convertibles driven with the soft top down. NEQ's own wording is internally ambiguous — 'SFI and/or FIA approved arm restraint system(s) must be used and is recommended in any case' — but is treated here as a real (if loosely drafted) requirement for open-top/top-down driving rather than a mere suggestion. Closed cars, and open-top cars with the top up and windows raised, are not addressed by this rule.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Must be SFI and/or FIA approved per the Open Top Cars page — no specific slash-level or FIA spec number is cited.",
      citation: { ...openTopPage, section: "Open Top Cars / Convertibles" },
      confidence: "medium",
      notes:
        "Confidence is medium rather than high specifically because of the source's self-contradictory phrasing ('must be used and is recommended'). Open-top cars without factory rollover protection also face separate roll-cage/harness vehicle requirements (four-point cage, four-point ASM harness, 'broomstick rule' clearance) — out of scope for this app's driver-PPE categories.",
    },
  },
};

export const neqRulesets: Ruleset[] = [hpde];
