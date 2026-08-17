import { CategoryRule, Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "BMW CCA Club Racing Rules",
  version: "2026 Q2, 7/27/2026",
  url: "https://bmwccaclubracing.com/wp-content/uploads/2026/07/BMW-CCA-Club-Racing-Rules-2026-Q2-Final.pdf",
};

// Section III "Safety" applies identically "to all cars in all classes" (Sport, Prepared, Modified,
// SpecE36, Spec E30, Spec Mini, Spec E46, E30 M3 Touring Car, PWR) — driver PPE doesn't vary by
// class, only car-prep/weight rules do (out of this app's scope), so a single ruleset covers the
// whole Club Racing program.
const clubRacing: Ruleset = {
  id: "bmwcca-club-racing",
  bodyId: "bmwcca",
  bodyName: "BMW CCA Club Racing",
  disciplineName: "Club Racing (Sport / Prepared / Modified / Spec Classes / PWR)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "III. Safety, B. Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "Rule text: 'SA-2015 will be allowed until the end of 2026' — after that, SA-2020 or newer only." },
        { standardId: "sfi-31.1a", note: "Rulebook table: open-faced SFI spec." },
        { standardId: "sfi-31.2a", note: "Rulebook table: 'Closed-faced purchased before 12/31/2014' — gated by purchase date, not manufacture date." },
        { standardId: "sfi-31.1-2015", note: "Rulebook table just says bare 'SFI 31.1' for 'Closed-faced purchased after 1/1/2015,' with no generation year given. This app's registry only has yeared SFI 31.1 entries — mapped here to the 2015/2020 generations as a reasonable approximation, not a literal match." },
        { standardId: "sfi-31.1-2020", note: "Same mapping gap as above." },
        { standardId: "fia-8859-2015", note: "Rulebook table just says 'FIA 8859/8860, All' with no generation specified — current-era FIA generations listed as a reasonable interpretation." },
        { standardId: "fia-8859-2020" },
        { standardId: "fia-8859-2024" },
        { standardId: "fia-8860-2010" },
        { standardId: "fia-8860-2018" },
        { standardId: "fia-8860-2024" },
      ],
      fullFaceRequirement: "conditional",
      fullFaceCondition:
        "Required only for drivers of vehicles without a full windshield (e.g. open-wheel/formula cars) — and even then, protective goggles with an open-face helmet are an explicit accepted alternative to a full-face helmet, so this isn't a hard full-face mandate the way it is at some other bodies.",
      citation: { ...sourceDoc, section: "III.B.2 Helmets" },
      confidence: "high",
      notes:
        "Snell M-rated helmets are explicitly not allowed. The SFI table is purchase-date gated ('purchased before/after 12/31/2014'), not manufacture-date gated like most other bodies' SFI rules — not modeled as expiresOn/validityYearsFromLabel for that reason. Helmet must be replaced after any significant impact with the ground or contact with the roll cage.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required specifically for drivers with a mustache and/or beard.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook just specifies 'fire-retardant balaclava' — no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.e" },
      confidence: "high",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Must be inspected and recertified by the original manufacturer every 5 years from the date of manufacture." },
        { standardId: "fia-8858-2002", noExpiration: true, note: "Tethers must be replaced 5 years after the date of manufacture; no other recertification is required unless the device is damaged." },
        { standardId: "fia-8858-2010", noExpiration: true, note: "Not explicitly named by the rulebook (which only cites FIA 8858-2002), but assumed acceptable as the current FIA generation, matching this app's usual convention for bodies with this gap." },
      ],
      citation: { ...sourceDoc, section: "III.B.3 Head and Neck Restraints" },
      confidence: "high",
      notes:
        "Required for all drivers, no exemption based on harness type (unlike bodies that only require HNR when a competition harness is fitted). Devices that merely claim to meet SFI or FIA specs but don't carry an actual certification sticker are explicitly not approved.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", note: "Must be worn with full-length upper and lower fire-rated underwear — see undergarment." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5", note: "Rulebook lists this as 'SFI 3.4A.'" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986", note: "Rulebook cites this standard twice, oddly worded both as 'FIA NORME 1986/1986' and 'FIA 8856-1986' — read here as the same FIA 1986 Standard." },
      ],
      citation: { ...sourceDoc, section: "III.B.1 Driving Apparel" },
      confidence: "high",
      notes: "Suit must cover the entire body except hands, feet, and head.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Fire-retardant... gloves are required' — no specific certification number is cited, just fire-retardant material; a certified SFI 3.3/FIA 8856 item obviously also qualifies.",
      citation: { ...sourceDoc, section: "III.B.1.d" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Driving shoes of a fire-retardant material are required' — no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.d" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Mandatory (full-length upper and lower) if the driving suit is SFI 3.2A/1. For all other suit tiers, fire-retardant underwear is 'strongly recommended' rather than required — cotton underwear is explicitly discouraged due to steam-burn risk.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'fire retardant NOMEX or Carbon-X underwear' — a material description, no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.c" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for open cars, including convertibles with an installed hardtop — i.e. fitting a hardtop does not exempt a convertible from this requirement, unlike most other bodies.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook just says 'approved arm restraints' — no specific certification standard named.",
      citation: { ...sourceDoc, section: "III.B, Arm Restraints" },
      confidence: "high",
    },
  },
};

// ============================================================================================
// BMW CCA Driving Events Operations Manual — a separate program from Club Racing above (chapter-
// run HPDE, autocross/gymkhana/car-control clinics, and ice autocross, governed by the National
// Driving Events Committee rather than Club Racing's own rules body). Read directly and in full
// (32 pages) — confidence is high throughout. This manual is far thinner on driver PPE than Club
// Racing: it only ever mandates a helmet (with narrow exceptions), plus a convertible-specific
// arm-restraint requirement for HPDE and a shoe requirement for autocross. It never mentions a
// firesuit, gloves, HANS/HNR, undergarment, or balaclava requirement anywhere for any of these
// three event types — those are modeled as honest not_addressed gaps, not omissions.
// ============================================================================================

const deSourceDoc = {
  title: "BMW CCA Driving Events Operations Manual",
  version: "Last updated 3/24/2025",
  url: "https://www.bmwcca.org/sites/default/files/2025-12/Driving-Events-Manual03242025.pdf",
};

// Section 2.2.10's helmet-rating table is the club-wide standard referenced by both Driving
// Schools/HPDE (§2.3.3.1) and Autocross/Gymkhana/Car-Control Clinics (§2.4.6.1).
const deHelmetRule: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "snell-sa2020", noExpiration: true },
    { standardId: "snell-sa2025", noExpiration: true, note: "Not literally named in this manual (dated 3/24/2025, before this generation's release), but obviously covered as the current Snell SA standard." },
    { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "Manual: a helmet is allowed 'until the end of the eleventh year of its standard's release' — SA2015 through end of calendar year 2026." },
    { standardId: "snell-m2020d", expiresOn: "2026-12-31", note: "Manual: 'On the release of the Snell 2025 standard, M-rated (motorcycle) helmets will no longer be allowed. M2020 helmets will be grandfathered until 12/31/2026.' M2015 is not mentioned in this grandfather clause and isn't included here for that reason. The manual doesn't distinguish Duro (D) vs Race (R) M2020 variants — both are listed as a best-effort mapping." },
    { standardId: "snell-m2020r", expiresOn: "2026-12-31", note: "Same M2020 grandfather clause as snell-m2020d." },
    { standardId: "fia-8860-2010", expiresOn: "2028-12-31" },
    { standardId: "fia-8860-2018", noExpiration: true },
    { standardId: "fia-8860-2018-abp", noExpiration: true },
    { standardId: "fia-8859-2015", noExpiration: true },
    { standardId: "fia-8859-2024", noExpiration: true },
  ],
  citation: { ...deSourceDoc, section: "2.2.10 Helmets" },
  confidence: "high",
  notes:
    "Open-face helmets are allowed; full-face is only recommended, not required. Face shields are recommended and should be down/locked whenever a helmet is required; if no shield, some form of eye protection should be worn. Cars with airbags: the helmet must not have a sun visor extending above the face shield, and any face shield present must be down and locked (an open/partial shield could snag an exploding airbag and load the neck).",
};

// Driving Schools / HPDE (§2.3). In-car instruction, run groups, etc. are out of this app's scope.
const hpde: Ruleset = {
  id: "bmwcca-de-hpde",
  bodyId: "bmwcca",
  bodyName: "BMW CCA",
  disciplineName: "Driving Schools / HPDE",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...deSourceDoc, section: "2.3 Driving Schools" }],
  categories: {
    helmet: {
      ...deHelmetRule,
      citation: { ...deSourceDoc, section: "2.3.3.1 Helmets; 2.2.10 Helmets" },
      notes:
        deHelmetRule.notes +
        " Must be worn by all drivers and passengers during all in-car sessions except low-speed track-familiarization sessions (50 mph or less) or touring laps.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section — only a helmet and lap/shoulder belts are addressed.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned in the Driving Schools/HPDE section — the closed-toe/closed-heel shoe rule elsewhere in this manual is written specifically for §2.4 (Autocross/Gymkhana/Car-Control Clinics), not HPDE.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required specifically for soft-top convertibles (cars with a retractable soft top and/or fully removable hardtop — not cars with an integrated retractable factory hardtop, which aren't considered 'convertibles' here) in order to participate in any session where helmets are required. A roll bar/cage meeting the manual's Appendix 1 spec is also required for the same cars. At the chapter's discretion, a car with factory-fixed rollover protection and a removable roof section may be allowed instead, if that protection clears the same Helmet Reference Plane spec.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Manual just says 'arm restraints' — no specific certification standard named.",
      citation: { ...deSourceDoc, section: "2.3.18 Convertibles" },
      confidence: "high",
      notes: "Chapters may also elect to exclude convertibles/removable-roof cars from helmet-required sessions entirely, regardless of this equipment.",
    },
  },
};

// Autocross, Gymkhana, and Car-Control Clinics (§2.4) — the manual states its minimum standards
// apply to all three event types unless stated otherwise, so one ruleset covers all three.
const autocross: Ruleset = {
  id: "bmwcca-de-autocross",
  bodyId: "bmwcca",
  bodyName: "BMW CCA",
  disciplineName: "Autocross / Gymkhana / Car-Control Clinics",
  disciplineGroup: "Autocross",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...deSourceDoc, section: "2.4 Autocross, Gymkhana, and Car-Control Clinics" }],
  categories: {
    helmet: {
      ...deHelmetRule,
      citation: { ...deSourceDoc, section: "2.4.6.1 Helmets; 2.2.10 Helmets" },
      notes: deHelmetRule.notes + " Must be worn by both driver and passenger — no low-speed exception is stated for this event type (unlike HPDE).",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes:
        "Not mentioned for autocross/gymkhana/car-control clinics generally. §2.4.6.3 does require a full-face helmet, a motorsports-style collar neck brace, and gloves/jacket/full-length pants of leather, vinyl, or abrasion-resistant nylon — but only for competitors driving go-karts, a narrow vehicle-type exception not modeled as the general rule here.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics generally — see the go-kart-specific exception noted under firesuit.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Manual: 'Closed-toe and closed-heel shoes are required when on course or within any restricted area' — no fire-resistance or certification requirement.",
      citation: { ...deSourceDoc, section: "2.4.6.4 Footwear" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in this section, including for open cars.",
    },
  },
};

// Ice Autocross (§2.5) — "all minimum standards in this manual for autocross also apply to ice
// autocross, except as detailed" in §2.5, which only overrides the helmet rule (and car
// classification/vehicle-type rules out of this app's scope) — so shoes are still required here
// via that inheritance clause, same as regular autocross.
const iceAutocross: Ruleset = {
  id: "bmwcca-de-ice-autocross",
  bodyId: "bmwcca",
  bodyName: "BMW CCA",
  disciplineName: "Ice Autocross",
  disciplineGroup: "Ice Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...deSourceDoc, section: "2.5 Ice Autocross" }],
  categories: {
    helmet: {
      requirement: "recommended",
      citation: { ...deSourceDoc, section: "2.5.4 Helmets" },
      confidence: "high",
      notes: "Manual: 'Helmets are not required due to the low speed (40 mph max) of these events... Use of helmets is suggested for all timed/competitive events.'",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Inherited from the regular Autocross section's closed-toe/closed-heel shoe rule via §2.5.1's 'all standards also apply' clause — no fire-resistance or certification requirement.",
      citation: { ...deSourceDoc, section: "2.4.6.4 Footwear (applies via 2.5.1)" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
  },
};

export const bmwccaRulesets: Ruleset[] = [clubRacing, hpde, autocross, iceAutocross];
