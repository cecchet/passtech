import { CategoryRule, Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_FUEL_CELL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

// ============================================================================================
// IMPORTANT SCOPE FLAG — READ BEFORE INTEGRATING
// The source is a Google-Docs-"published" HTML page (2026 GRIDLIFE GTCR Rules), not a PDF —
// it could only be read here via an AI-summarization pass over the page rather than a direct
// verbatim read of the source text. That summarization pass itself flagged a real ambiguity in
// the source: §6 "Driver's Safety Equipment" requires the full suit/HANS/gloves/fire-shoes/
// balaclava/underwear kit for "Unlimited Time Attack" and "Unlimited or GLTC" participants, but
// the document never defines what makes a TrackBattle Time Attack car/entry "Unlimited" versus
// any other tier — no class list, cage/harness threshold, or other criterion is given anywhere
// in the rulebook. Confidence is medium throughout this file as a result. The base TrackBattle
// Time Attack ruleset below models the plainly-stated tier (long pants, closed-toe shoes,
// helmet) rather than guessing at the Unlimited threshold — every category's notes flag the
// stricter Unlimited-tier requirement that may also apply. Recommend a direct read of the
// published doc, and confirmation from GridLife tech, before treating this as final.
// GRIDLIFE Drift is not modeled here — the source states it has no distinct driver PPE rules of
// its own beyond the general competitive standard (roll cage requirements aside, which are
// vehicle equipment, out of this app's scope).
// ============================================================================================

const sourceDoc = {
  title: "GRIDLIFE GTCR 2026 Rules",
  version: "2026",
  url: "https://docs.google.com/document/d/e/2PACX-1vRgYXp-ejrfBFQSysJcY9RzJDpQY1mTGazF82qOWZRZFTj3EkJJ-yBQU6BK2ODdZHdFrhIZSNUdPop2/pub",
};

const helmetRule: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "snell-sa2015", noExpiration: true },
    { standardId: "snell-sa2020", noExpiration: true },
    { standardId: "snell-sa2025", noExpiration: true },
  ],
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
  notes:
    "'Snell SA 2015 or newer' required — no FIA/SFI alternative and no stated expiration/sunset for any accepted generation. Motorcycle (M-rated) helmets are explicitly prohibited. Applies identically across all GRIDLIFE formats.",
};

// HPDE and base-tier TrackBattle Time Attack share the same plain-clothing requirement.
const basicShoesRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Closed-toe shoes required; no sandals. No fire-resistance or certification required at this tier.",
  citation: { ...sourceDoc, section: "Clothing (general)" },
  confidence: "medium",
};

const basicFiresuitRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Long pants required (non-synthetic material, e.g. cotton is acceptable); no shorts. Long sleeves are highly encouraged but not mandatory at this tier.",
  citation: { ...sourceDoc, section: "Clothing (general)" },
  confidence: "medium",
};

// Unlimited Time Attack / GLTC / GLGT / RUSH SR share this full driver-PPE tier per §6.
const competitiveFiresuitRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: [
    { standardId: "sfi-3.2a-1" },
    { standardId: "sfi-3.2a-5" },
    { standardId: "sfi-3.2a-10" },
    { standardId: "sfi-3.2a-15" },
    { standardId: "sfi-3.2a-20" },
    { standardId: "fia-8856-2000" },
  ],
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
  notes:
    "Suit must cover neck-to-ankles/wrists, rated SFI 3.2A/1 or higher, or FIA 8856-2000. One-piece strongly recommended. FIA 8856-2018 is not explicitly confirmed by this research pass — not added without direct confirmation from GridLife, unlike this app's usual convention for bodies read directly from source text.",
};

const competitiveGlovesRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Fire-resistant gloves required, no holes permitted. No specific SFI 3.3 tier or FIA spec number was identified in this research pass.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveShoesRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Fire-resistant shoes required, no holes from wear.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveSocksRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Nomex socks required at this tier — same clause as the fire-resistant shoes requirement.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveHnrRule: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "sfi-38.1" },
    { standardId: "fia-8858-2002" },
    { standardId: "fia-8858-2010" },
  ],
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
  notes: "Named examples: HANS, NEXTGEN. No specific slash-level or generation stated beyond the SFI 38.1 / FIA 8858-2002/2010 spec families. Only 'encouraged,' not required, for HPDE.",
};

const competitiveUndergarmentRule: CategoryRule = {
  requirement: "conditional",
  condition: "Required unless the driving suit itself is rated FIA 8856-2000 or SFI 3.2A/5-or-higher, in which case it's not required.",
  undergarmentTriggerStandards: ["sfi-3.2a-1"],
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Fire-resistant underwear required at lower suit tiers — no specific certification number given for the underwear itself.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveBalaclavaRule: CategoryRule = {
  requirement: "conditional",
  condition: "Highly recommended for all drivers at this tier; required specifically for drivers with facial hair.",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Described as a 'Nomex/fireproof balaclava worn under helmets' — no specific certification number stated.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const armRestraintNotRequiredNote =
  "Not required for GLTC/GLGT or Time Attack per this rulebook — arm restraints are encouraged for classes running with a competition harness, but not mandated. Mandatory only in RUSH SR (see that ruleset).";

// ============================================================================================
// CAR SAFETY GEAR
// Same source-quality caveat as above (HTML/AI-summarized, not a direct verbatim PDF read) —
// confidence stays medium throughout, matching the driver-gear entries above. Two research
// passes over the published doc found NO on-car requirement for fire extinguishers, fire
// suppression systems, kill switches, tow ropes/straps, emergency triangles, or first aid kits,
// for ANY discipline — those are modeled as not_addressed below rather than fabricated. Seats
// and harnesses are only addressed indirectly, through a clause tying a "proper height-back
// seat" and a certified harness to having a rollbar/cage — modeled as required only where a
// rollcage is itself required (GLTC/GLGT, RUSH SR), consistent with this file's existing
// Unlimited-tier-ambiguity handling for TrackBattle Time Attack. Roll cages themselves remain
// out of this app's scope (no "rollcage" group categories exist yet). Arm restraints and window
// nets are NOT framed as interchangeable anywhere in this source (unlike some other bodies) —
// satisfiedByAlternative is intentionally omitted on window_net as a result.
// ============================================================================================

const harnessAcceptedStandards = [
  {
    standardId: "sfi-16.1",
    validityYearsFromLabel: 10,
    note: "GRIDLIFE requires harnesses be 'IN DATE' — 10 years or less since the manufacture date stamped on the harness — a body-specific age rule distinct from SFI's own listed recertification interval.",
  },
  { standardId: "sfi-16.5", validityYearsFromLabel: 10, note: "Same 10-year-from-manufacture-date rule as SFI 16.1." },
  { standardId: "sfi-16.6", validityYearsFromLabel: 10, note: "Same 10-year-from-manufacture-date rule as SFI 16.1." },
  {
    standardId: "fia-8853-2016",
    note: "FIA-labeled harnesses are accepted per 'Non-labeled (SFI, FIA, etc) knock off... will not be allowed' — GRIDLIFE's 10-year age rule is stated for 'SFI ratings' specifically and isn't explicitly restated for FIA-labeled harnesses, which typically print their own expiration date.",
  },
  { standardId: "fia-8853-98" },
  { standardId: "fia-8854-98" },
];

const competitiveHarnessRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: harnessAcceptedStandards,
  materialNote:
    "'Shoulder belts must be 3+\" wide unless narrower is required for use with a head and neck restraint (HANS specific belts, etc), and include anti-submarine belts. 5+ points or brand specific ASM technology.' 'All cars with rollbars or rollcages shall use 5 point-or-greater harnesses or harnesses with brand specific ASM (anti submarine) technology, with SFI ratings, and harnesses must be \"IN DATE\", meaning, 10 years or less shall have passed since manufacture of the harness, as indicated on the date stamp of the harness. No visible UV fades, or weld burns allowed on harnesses.' 'Harnesses must be name-brand, quality pieces. Non-labeled (SFI, FIA, etc) \"knock off\", or \"show car only\" harnesses will not be allowed.' Mounting points to sheet metal must be backed by large plates on the opposite side.",
  citation: { ...sourceDoc, section: "Harnesses/Seat Belts" },
  confidence: "medium",
  notes:
    "GRIDLIFE ties this requirement to having a rollbar/cage: 'Harnesses must be used with a proper height-back seat and a rollbar or cage. Harnesses used without a rollbar or cage may result in a failure at tech inspection, and will not be allowed on the track.' A rollcage is itself required for this discipline (roll-cage rules, out of this app's scope). A narrow carve-out exists for specific convertibles with factory rollover protection (2002 Porsche Boxster, Honda S2000, MINI Cooper Convertible named as examples): 'Convertibles with factory rollover protection... are allowed to run with the factory seats and seatbelts.' Belt width may be narrower than 3\" when paired with a HANS-specific head-and-neck restraint; that pairing is unaffected here.",
};

const competitiveSeatRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_SEAT_STANDARDS,
  materialNote:
    "No standalone seat clause or certification number (e.g. SFI 39.1/39.2, FIA 8855/8862) exists anywhere in the document — inferred from the harness rule: 'Harnesses must be used with a proper height-back seat and a rollbar or cage.' General boilerplate also applies: 'Seats and all safety gear must be mounted properly and within all generally accepted industry standards, and improper safety gear or quality of install may result in the loss of racing time or refusal to be allowed to race.'",
  citation: { ...sourceDoc, section: "Harnesses/Seat Belts" },
  confidence: "medium",
  notes:
    "Inferred, not stated outright as a standalone seat rule — GRIDLIFE never names a seat certification standard anywhere in the document. Re-confirmed directly against the cached source (rulebooks/gridlife-gtcr-rules.html): unlike PHA's seat clause, which requires a 'one-piece, bucket-type race seat... fore/aft and lateral support' construction (a bar that effectively excludes an unmodified OE seat), GRIDLIFE's 'proper height-back seat' phrase names no bucket-type/lateral-support construction requirement and doesn't otherwise exclude a stock/OEM seat — materialOnlyAccepted is set true on that basis. This reading is reinforced by GRIDLIFE's own convertible carve-out: cars with factory rollover protection (2002 Porsche Boxster, Honda S2000, MINI Cooper Convertible named as examples) 'are allowed to run with the factory seats and seatbelts,' confirming GRIDLIFE does treat a factory seat as legitimate in at least some cases. That said, 'height-back' is still a real construction bar — a low-back stock seat with a separate, non-integrated headrest likely would NOT qualify once a harness and rollbar/cage are fitted, so this isn't a blanket pass for any stock seat, only ones with a tall, integrated seatback. A certified FIA/SFI seat obviously also satisfies this even though GRIDLIFE doesn't itself name a minimum spec — the generic seat standards list is offered on that basis.",
};

const competitiveWindowNetRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote:
    "'Cars must have drivers side window nets and are encouraged to have center nets also.' No SFI/FIA certification number and no quick-release-mechanism language is given anywhere in the document for window nets.",
  citation: { ...sourceDoc, section: "Window Nets" },
  confidence: "medium",
  notes:
    "Not framed as an alternative to (or interchangeable with) an arm restraint anywhere in the document — unlike some other sanctioning bodies, GRIDLIFE never states a window net can substitute for an arm restraint or vice versa. The two are independent requirements here: this discipline mandates a driver's-side window net outright, while arm restraints remain merely encouraged, not required (see arm_restraint). satisfiedByAlternative is intentionally NOT set for this reason.",
};

const fuelCellRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
  materialNote:
    "'Fuel tanks must be either OEM quality or better if using a factory style tank. Factory tanks are only permitted on cars where the tank is located behind the driver and in front of the rear wheels.' Aftermarket cells are also allowed if 'properly installed and mounted' — limited to 'hard plastics/rotary formed plastic or ballistic-style bladders contained within a full, quality constructed steel box, with a bulkhead of steel or aluminum isolating the driver from the box containing the cell,' with all structures 'attached completely and entirely to the shell of the car and/or rollcage structure.' Fuel lines in the driver's compartment must be OEM/OEM-quality steel hardline or braided-stainless flexible line, isolated from the driver and from sharp edges.",
  citation: { ...sourceDoc, section: "Fuel Cells and Fuel Systems" },
  confidence: "medium",
  notes:
    "Applies identically across all GRIDLIFE formats including HPDE — phrased as a blanket vehicle-prep rule rather than a competitive-tier-only requirement, so an unmodified street car with its stock tank in the stock location is compliant by default. No SFI 28.1 / FIA FT3 / FT3.5 / FT5 certification number is cited anywhere in the document for aftermarket cells — since GRIDLIFE doesn't name a specific spec, any registered fuel-cell homologation is treated as acceptable for a driver who does choose to run a certified cell.",
};

const notAddressedFireExtinguisher: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sourceDoc, section: "Fueling Procedures" },
  confidence: "medium",
  notes:
    "The only extinguisher mention anywhere in the document is for refueling stations — 'Fire extinguishers shall be present and in a readily accessible location during any refueling from containers' — a track/paddock fueling-area requirement, not a requirement to carry a handheld unit in the car itself. No car-mounted extinguisher requirement (quantity, rating, or mounting) was found for any discipline across two separate research passes.",
};

const notAddressedFireSuppression: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sourceDoc },
  confidence: "medium",
  notes: "No on-board/automatic fire suppression system requirement of any kind was found anywhere in the document, for any discipline.",
};

const notAddressedKillSwitch: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sourceDoc },
  confidence: "medium",
  notes: "No kill switch / master switch / battery cut-off requirement was found anywhere in the document, for any discipline.",
};

const towHookRule: CategoryRule = {
  requirement: "required",
  materialNote:
    "'All cars must have at least 1 tow hook on the front and 1 tow hook on the back, either labeled or in an obvious location. Tow hooks must be strong enough to bear the weight of the car under a snapping/yanking condition if the car becomes stuck and they must be used. OEM tie down locations are acceptable if they can easily be accessed and are labeled (tape, etc).'",
  citation: { ...sourceDoc, section: "Tow Hooks/Tow Points" },
  confidence: "medium",
  notes:
    "Applies identically to every GRIDLIFE format including HPDE — 'A lack of tow hook/strap/knowledge of how to rapidly hook a tow truck to the vehicle will result in failing of tech inspection.' No color-marking requirement is stated. Tow hooks and tow ropes/straps are referenced together in tech-inspection language but are modeled as separate categories in this app — see tow_rope.",
};

const notAddressedTowRope: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sourceDoc, section: "Tow Hooks/Tow Points" },
  confidence: "medium",
  notes:
    "The document requires tow hooks/points (see tow_hook) and references 'tow truck' hookup at tech inspection, but never separately requires the competitor to carry their own tow rope/strap in the car.",
};

const notAddressedEmergencyTriangle: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sourceDoc },
  confidence: "medium",
  notes: "No emergency/warning triangle requirement was found anywhere in the document, for any discipline.",
};

const notAddressedFirstAidKit: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sourceDoc },
  confidence: "medium",
  notes: "No driver/car-carried first aid kit requirement was found anywhere in the document, for any discipline.",
};

// HPDE: beginner/intermediate/advanced run groups share identical driver-equipment rules per
// the source (no tiered PPE by skill level, only by driving-privilege/passing protocols, which
// are out of this app's scope).
const hpde: Ruleset = {
  id: "gridlife-hpde",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "HPDE (Beginner / Intermediate / Advanced)",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "General HPDE Safety Devices; Clothing" }],
  categories: {
    helmet: helmetRule,
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "The balaclava recommendation/facial-hair requirement in §6 is written for the competitive tiers (Unlimited Time Attack/GLTC/GLGT/RUSH SR) — not stated as applying to HPDE.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "HANS/NEXTGEN-type devices are 'encouraged but not mandated' for HPDE specifically.",
    },
    firesuit: basicFiresuitRule,
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Clothing (general)" },
      confidence: "medium",
      notes: "No glove requirement stated for HPDE.",
    },
    shoes: basicShoesRule,
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Clothing (general)" },
      confidence: "medium",
      notes: "No sock requirement stated for HPDE.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "Not mentioned for HPDE; no certified-suit requirement exists at this tier that would trigger a fire-resistant-underwear condition.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: armRestraintNotRequiredNote,
    },
    seat: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Harnesses/Seat Belts" },
      confidence: "medium",
      notes:
        "No standalone seat requirement or certification is stated anywhere in the document. The only seat-related clause ties a height-back seat to harness/cage use, and neither a rollcage ('recommended,' not required) nor a certified harness ('optional but encouraged,' not required) is mandated for HPDE.",
    },
    belts_harness: {
      requirement: "recommended",
      materialOnlyAccepted: true,
      acceptedStandards: harnessAcceptedStandards,
      materialNote:
        "Stock/OEM belts are fine for HPDE — GRIDLIFE's certified-harness rule ('5 point-or-greater... with SFI ratings... IN DATE... 10 years or less since manufacture') only binds cars actually fitted with a rollbar/cage, which is itself merely 'recommended,' not required, for HPDE. If a rollbar/cage IS fitted, the same certified-harness rule as the competitive tiers applies: 'Harnesses used without a rollbar or cage may result in a failure at tech inspection.'",
      citation: { ...sourceDoc, section: "Harnesses/Seat Belts" },
      confidence: "medium",
      notes: "Not mandatory for HPDE by itself — the source describes harnesses as 'optional but encouraged with rollbars' for this discipline.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Window Nets" },
      confidence: "medium",
      notes: "Not mentioned for HPDE — the window-net clause explicitly scopes to 'GLTC, GLGT, GLRSR (Racing)' only.",
    },
    fuel_cell: fuelCellRule,
    fire_extinguisher: notAddressedFireExtinguisher,
    fire_suppression: notAddressedFireSuppression,
    kill_switch: notAddressedKillSwitch,
    tow_hook: towHookRule,
    tow_rope: notAddressedTowRope,
    emergency_triangle: notAddressedEmergencyTriangle,
    first_aid_kit: notAddressedFirstAidKit,
  },
};

// TrackBattle Time Attack: models the plainly-stated base tier. See file-level note above —
// the source also references a stricter "Unlimited Time Attack" tier requiring the full
// suit/HANS/gloves/fire-shoes/balaclava/underwear kit, but never defines what makes an entry
// "Unlimited." Every category below flags that unresolved ambiguity.
const trackBattleTimeAttack: Ruleset = {
  id: "gridlife-trackbattle-time-attack",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "TrackBattle Time Attack",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "6. Driver's Safety Equipment" }],
  categories: {
    helmet: helmetRule,
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required/recommended only for 'Unlimited Time Attack' participants per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only for 'Unlimited Time attack' per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    firesuit: {
      ...basicFiresuitRule,
      notes: "Base tier: long pants (non-synthetic). §6 separately requires a full SFI 3.2A/1+ or FIA 8856-2000 suit for 'Unlimited Time attack' participants — the source doesn't define the Unlimited threshold (see file-level note).",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only for 'Unlimited or GLTC' participants per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    shoes: {
      ...basicShoesRule,
      notes: "Base tier: closed-toe shoes, no certification. §6 separately requires fire-resistant shoes for 'Unlimited or GLTC' participants — the source doesn't define the Unlimited threshold (see file-level note).",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only for 'Unlimited or GLTC' participants per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only at the Unlimited tier (unless the suit itself is FIA 8856-2000/SFI 3.2A/5+) — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: armRestraintNotRequiredNote,
    },
    seat: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Harnesses/Seat Belts" },
      confidence: "medium",
      notes:
        "No standalone seat requirement or certification is stated anywhere in the document. The only seat-related clause ties a height-back seat to harness/cage use ('Harnesses must be used with a proper height-back seat and a rollbar or cage') — a rollcage is only required for the 'Unlimited' tier of Time Attack per the roll-cage rules, and the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    belts_harness: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Harnesses/Seat Belts" },
      confidence: "medium",
      notes:
        "'All cars with rollbars or rollcages shall use 5 point-or-greater harnesses or harnesses with brand specific ASM (anti submarine) technology, with SFI ratings' — but a rollcage is only required for the 'Unlimited' tier of Time Attack, and the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Window Nets" },
      confidence: "medium",
      notes:
        "The window-net clause explicitly scopes to 'GLTC, GLGT, GLRSR (Racing)' only — Time Attack (base or Unlimited tier) is not included in that list anywhere in the document, so this isn't a case of the usual Unlimited-tier ambiguity (see file-level note); it's a clean absence for this discipline.",
    },
    fuel_cell: fuelCellRule,
    fire_extinguisher: notAddressedFireExtinguisher,
    fire_suppression: notAddressedFireSuppression,
    kill_switch: notAddressedKillSwitch,
    tow_hook: towHookRule,
    tow_rope: notAddressedTowRope,
    emergency_triangle: notAddressedEmergencyTriangle,
    first_aid_kit: notAddressedFirstAidKit,
  },
};

// GLTC and GLGT are treated identically for driver PPE per §6 (car-classification differences
// between the two are out of this app's scope) — modeled as a single ruleset.
const gltcGlgt: Ruleset = {
  id: "gridlife-gltc-glgt",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "Touring Cup (GLTC) / Grand Touring (GLGT)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "6. Driver's Safety Equipment" }],
  categories: {
    helmet: helmetRule,
    balaclava: competitiveBalaclavaRule,
    hnr: competitiveHnrRule,
    firesuit: competitiveFiresuitRule,
    gloves: competitiveGlovesRule,
    shoes: competitiveShoesRule,
    socks: competitiveSocksRule,
    undergarment: competitiveUndergarmentRule,
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: armRestraintNotRequiredNote,
    },
    seat: competitiveSeatRule,
    belts_harness: competitiveHarnessRule,
    window_net: competitiveWindowNetRule,
    fuel_cell: fuelCellRule,
    fire_extinguisher: notAddressedFireExtinguisher,
    fire_suppression: notAddressedFireSuppression,
    kill_switch: notAddressedKillSwitch,
    tow_hook: towHookRule,
    tow_rope: notAddressedTowRope,
    emergency_triangle: notAddressedEmergencyTriangle,
    first_aid_kit: notAddressedFirstAidKit,
  },
};

// RUSH SR: same competitive-tier driver PPE as GLTC/GLGT, plus its own mandatory arm-restraint
// rule. Full vehicle/driver specs are deferred by GRIDLIFE to a separate "2026 RUSH SR Spec
// Series Technical Regulations" document not covered by this research pass.
const rushSr: Ruleset = {
  id: "gridlife-rush-sr",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "RUSH SR (Spec Series)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [
    { ...sourceDoc, section: "GLRSR (RUSH SR)" },
    { title: "2026 RUSH SR Spec Series Technical Regulations", version: "2026" },
  ],
  categories: {
    helmet: helmetRule,
    balaclava: competitiveBalaclavaRule,
    hnr: competitiveHnrRule,
    firesuit: competitiveFiresuitRule,
    gloves: competitiveGlovesRule,
    shoes: competitiveShoesRule,
    socks: competitiveSocksRule,
    undergarment: competitiveUndergarmentRule,
    arm_restraint: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      citation: { ...sourceDoc, section: "GLRSR (RUSH SR)" },
      confidence: "medium",
      notes:
        "Mandatory for all drivers, all on-track sessions. GRIDLIFE defers the exact certification/spec to the separate '2026 RUSH SR Spec Series Technical Regulations' document, which this research pass didn't cover — this ruleset reflects only the overview-level mention in the main GTCR rules.",
    },
    seat: {
      ...competitiveSeatRule,
      citation: { ...sourceDoc, section: "GLRSR (RUSH SR)" },
      notes:
        competitiveSeatRule.notes +
        " GRIDLIFE also defers full vehicle spec to the separate '2026 RUSH SR Spec Series Technical Regulations' document, which this research pass didn't cover.",
    },
    belts_harness: {
      ...competitiveHarnessRule,
      citation: { ...sourceDoc, section: "GLRSR (RUSH SR)" },
      notes:
        competitiveHarnessRule.notes +
        " RUSH SR also separately mandates arm restraints for all on-track sessions (see arm_restraint, above) and defers full vehicle spec to the separate '2026 RUSH SR Spec Series Technical Regulations' document, not covered by this research pass.",
    },
    window_net: {
      ...competitiveWindowNetRule,
      citation: { ...sourceDoc, section: "GLRSR (RUSH SR)" },
      notes:
        "Not framed as an alternative to (or interchangeable with) an arm restraint anywhere in the document. Unlike GLTC/GLGT, RUSH SR requires BOTH: a driver's-side window net (this rule) AND arm restraints for all on-track sessions (see arm_restraint, required outright) — the two are independent, additive requirements here, not substitutes. satisfiedByAlternative is intentionally NOT set for this reason. GRIDLIFE also defers full vehicle spec to the separate '2026 RUSH SR Spec Series Technical Regulations' document, not covered by this research pass.",
    },
    fuel_cell: fuelCellRule,
    fire_extinguisher: notAddressedFireExtinguisher,
    fire_suppression: notAddressedFireSuppression,
    kill_switch: notAddressedKillSwitch,
    tow_hook: towHookRule,
    tow_rope: notAddressedTowRope,
    emergency_triangle: notAddressedEmergencyTriangle,
    first_aid_kit: notAddressedFirstAidKit,
  },
};

export const gridlifeRulesets: Ruleset[] = [hpde, trackBattleTimeAttack, gltcGlgt, rushSr];
