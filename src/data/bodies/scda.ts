import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const techForm = {
  title: "SCDA Tech Inspection Form",
  version: "2026 Annual Inspection",
  url: "https://scda1.com/wp-content/uploads/2026/03/Sports-Car-Driving-Association-Tech-Inspection.pdf",
};

const faq = {
  title: "SCDA Driving & Track Event FAQ",
  url: "https://scda1.com/faq/",
};

// Tech form item 3-4: "Must be SNELL SA2020, SA2025, FIA 8859 or FIA 8860. FIA rated helmets
// must not exceed 10yrs from manufactured date. Any other helmet ratings are not acceptable.
// Either open or closed face. IF convertible, then closed face with visor down."
const helmetStandards = [
  { standardId: "snell-sa2020", noExpiration: true, note: "Tech form names only SA2020 and SA2025 as accepted Snell generations; no separate age-based expiration is stated for these beyond accepting only these two ratings." },
  { standardId: "snell-sa2025", noExpiration: true },
  { standardId: "fia-8859-2020", validityYearsFromLabel: 10, note: "Tech form cites 'FIA 8859' generically without a generation suffix: 'FIA rated helmets must not exceed 10yrs from manufactured date.'" },
  { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2024", validityYearsFromLabel: 10 },
];

const helmetRule = {
  requirement: "required" as const,
  acceptedStandards: helmetStandards,
  fullFaceRequirement: "conditional" as const,
  fullFaceCondition: "Closed face with visor down required for convertible cars. Open-face permitted in fixed-roof (closed) cars.",
  citation: { ...techForm, section: "Item 3 (Helmets) and Item 4 (Convertible policy)" },
  confidence: "high" as const,
  notes: "'Any other helmet ratings are not acceptable' per the tech form — this excludes Snell SA2015 and earlier, SFI-rated, DOT-only, and ECE helmets outright, a noticeably stricter list than most bodies in this app.",
};

const notAddressedBalaclava = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "medium" as const,
  notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the tech form/FAQ, just not yet re-checked.",
};

const notAddressedUndergarment = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "Not mentioned in either the tech inspection form or the event FAQ, for any car type.",
};

const notAddressedArmRestraint = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "Not mentioned by SCDA at the organization level for any car type, including convertibles/open cars. Specific host tracks may impose their own requirement independent of SCDA.",
};

// --- Car safety gear ---
// Full read of both source documents (tech form items 1-14, full FAQ page) found that none of
// SCDA's car-gear items differentiate by street-prepared vs. fully caged/track-prepped/race-car
// tier except item 13 (driver suit/gloves/shoes/HNR, already modeled above) and item 4 (convertible
// rollbar policy, not a tracked category here). Items 5 and 14 below apply to every car regardless
// of prep level, so the same rule objects are reused in both rulesets.

const notAddressedSeat = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "Seat construction/certification and slider-vs-fixed-mount are not mentioned in the tech inspection form or the FAQ, for any car type.",
};

// Tech form item 14: "Seat Belts: Seat belts must be in fully operational condition, and both
// driver and passenger must have the same restraint systems if there is an instructor riding. FIA
// or SFI rated Four-point Harnesses with (ASM) Anti-submarine technology is allowed. Race seatbelts
// 2 years or newer for SFI. 5 years or newer for FIA. Belts must not have any visible damage or
// wear." Applies to all cars — not scoped under item 13's caged/track-prepped/race-car tier.
const beltsHarnessRule = {
  requirement: "required" as const,
  materialOnlyAccepted: true,
  acceptedStandards: [
    { standardId: "sfi-16.1", validityYearsFromLabel: 2 },
    { standardId: "sfi-16.5", validityYearsFromLabel: 2 },
    { standardId: "sfi-16.6", validityYearsFromLabel: 2 },
    { standardId: "fia-8853-2016", validityYearsFromLabel: 5 },
    { standardId: "fia-8853-98", validityYearsFromLabel: 5 },
  ],
  materialNote:
    "Stock/OEM seat belts accepted as a baseline ('must be in fully operational condition... [no] visible damage or wear'). FIA- or SFI-rated four-point harnesses with ASM (anti-submarine) technology are separately named as an allowed upgrade, not a mandate — the form doesn't specify a particular SFI slash-level, so all currently-registered SFI 16.x / FIA 8853 generations are listed as accepted.",
  citation: { ...techForm, section: "Item 14 (Seat Belts)" },
  confidence: "high" as const,
  notes: "Expiration per the form: 'Race seatbelts 2 years or newer for SFI. 5 years or newer for FIA' — read as validity measured from the date on the belt's label. If there is an instructor riding, driver and passenger must use the same restraint system.",
};

const notAddressedWindowNet = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes:
    "Full document search of both the tech inspection form (all 14 items, including item 13's caged/track-prepped/race-car equipment list and item 14's seat belt spec) and the FAQ page found no window net requirement, for any car type. SCDA also never frames a window net as an alternative to an arm restraint — arm_restraint is separately not_addressed for this body too (see that category) — so the two aren't treated as interchangeable here and satisfiedByAlternative is intentionally omitted on both.",
};

const notAddressedFireExtinguisher = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No handheld fire extinguisher requirement, size, rating, or mounting spec found in the tech inspection form or the FAQ, for any car type.",
};

const notAddressedFireSuppression = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No onboard fire suppression system requirement found in the tech inspection form or the FAQ, for any car type.",
};

const notAddressedFuelCell = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "Fuel tank/fuel cell is not mentioned in the tech inspection form or the FAQ, for any car type — including the fully caged/track-prepped/race-car tier.",
};

const notAddressedWindowBreaker = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No window net, window breaker, or seatbelt-cutter tool requirement found in the tech inspection form or the FAQ, for any car type.",
};

const notAddressedKillSwitch = {
  requirement: "not_addressed" as const,
  citation: { ...techForm, section: "Item 5 (Tow Hooks)" },
  confidence: "high" as const,
  notes: "No master switch/battery cutoff requirement is stated. Item 5 only asks drivers to 'understand protocol to get your car into neutral in case of power failure' — a manual-neutral procedure, not a kill-switch mandate.",
};

// Tech form item 5: "TOW HOOKS must be installed if available. Please install one to prevent loss
// of track time for others and further damage to your car while being towed." Applies to all cars.
const towHookRule = {
  requirement: "conditional" as const,
  condition:
    "'Must be installed if available' — read as required only when the vehicle has a tow hook/point available to fit; not stated as an outright universal mandate for cars without one.",
  citation: { ...techForm, section: "Item 5 (Tow Hooks)" },
  confidence: "medium" as const,
  notes: "Framed around preventing 'loss of track time for others and further damage to your car while being towed,' rather than as an unconditional pass/fail tech-inspection item.",
};

const notAddressedTowRope = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No tow rope/strap requirement found in the tech inspection form or the FAQ, for any car type.",
};

const notAddressedEmergencyTriangle = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No warning/emergency triangle requirement found in the tech inspection form or the FAQ, for any car type.",
};

const notAddressedFirstAidKit = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No first aid kit requirement found in the tech inspection form or the FAQ, for any car type.",
};

const notAddressedHoodPins = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No hood pin, hood fastener, or positive hood-latching requirement found in the tech inspection form (all 14 items, including item 13's caged/track-prepped/race-car equipment list) or the FAQ, for any car type.",
};

const notAddressedSpillKit = {
  requirement: "not_addressed" as const,
  citation: { title: "SCDA Tech Inspection Form / SCDA FAQ" },
  confidence: "high" as const,
  notes: "No spill kit, spill containment, or absorbent-material requirement found in the tech inspection form or the FAQ, for any car type.",
};

// Street-prepared / stock cockpit cars: general Dress Code (FAQ) plus base helmet rule.
const hpdeStreet: Ruleset = {
  id: "scda-hpde-street",
  bodyId: "scda",
  bodyName: "SCDA (Sports Car Driving Association)",
  disciplineName: "HPDE Track Day — street-prepared car",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForm, faq],
  categories: {
    helmet: helmetRule,
    balaclava: notAddressedBalaclava,
    hnr: {
      requirement: "recommended",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
      notes: "FAQ: 'Proper Head and Neck restraint system is HIGHLY encouraged' — not a hard requirement for a street-prepared car. See the fully-caged/track-prepped/race-car ruleset for the tech form's separate H&NR mention at that tier (also only 'recommended' there).",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...techForm, section: "Item 13" },
      confidence: "high",
      notes: "SCDA's 2-layer SFI/FIA driving-suit requirement (tech form item 13) applies only to fully caged, track-prepped, or race cars — see the separate 'fully caged / track-prepped / race car' ruleset. Not required for a street-prepared car. Separately, the general Dress Code requires long pants (suggests long sleeves) for all drivers regardless of car prep; that's a plain clothing rule, not a fire-resistant garment requirement, so it is not reflected in this category.",
    },
    gloves: {
      requirement: "recommended",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "FAQ: 'Driving Gloves are suggest[ed]' — optional at this tier, no material or certification specified.",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "FAQ Dress Code: driving shoes or sneakers required; no boots, no open-toe shoes/sandals. No fire-resistance or certification specified.",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...faq, section: "Dress Code" },
      confidence: "medium",
      notes: "Not mentioned in the FAQ Dress Code section.",
    },
    undergarment: notAddressedUndergarment,
    arm_restraint: notAddressedArmRestraint,
    seat: notAddressedSeat,
    belts_harness: beltsHarnessRule,
    window_net: notAddressedWindowNet,
    fire_extinguisher: notAddressedFireExtinguisher,
    fire_suppression: notAddressedFireSuppression,
    fuel_cell: notAddressedFuelCell,
    window_breaker: notAddressedWindowBreaker,
    kill_switch: notAddressedKillSwitch,
    tow_hook: towHookRule,
    tow_rope: notAddressedTowRope,
    emergency_triangle: notAddressedEmergencyTriangle,
    first_aid_kit: notAddressedFirstAidKit,
    hood_pins: notAddressedHoodPins,
    spill_kit: notAddressedSpillKit,
    rollover_protection: {
      requirement: "conditional",
      rolloverProtectionByBodyStyle: { closed_roof: "not_addressed", convertible: "required", open_no_windshield: "required", open_wheel: "required" },
      condition:
        "Tech form item 4: 'Convertible vehicles must meet convertible policy. Must pass \"broomstick test\" with fixed rollbar: driver's helmet must be under a straight line from top of windshield to top of rollbar. Pop-up roll bars are not acceptable, unless deployed in fixed position and pass test.' Fixed-roof street cars aren't addressed by this rule at all.",
      citation: { ...techForm, section: "Item 4 (Convertible policy)" },
      confidence: "high",
    },
  },
};

// Fully caged / track-prepped / race car: tech form item 13. "Track prepped car" is defined there as
// "Vehicle in which the cockpit has been altered or modified in any way so that any part of the
// chassis or any firewall has been exposed."
const hpdeCaged: Ruleset = {
  id: "scda-hpde-caged",
  bodyId: "scda",
  bodyName: "SCDA (Sports Car Driving Association)",
  disciplineName: "HPDE Track Day — fully caged / track-prepped / race car",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForm, faq],
  categories: {
    helmet: helmetRule,
    balaclava: notAddressedBalaclava,
    hnr: {
      requirement: "recommended",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002" },
        { standardId: "fia-8858-2010" },
      ],
      citation: { ...techForm, section: "Item 13" },
      confidence: "high",
      notes: "'A SFI or FIA head and neck restraint device is also recommended' — still only recommended, not mandatory, even for a fully caged/track-prepped/race car per the tech form's exact wording.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
      ],
      materialNote: "Minimum 2-layer SFI- or FIA-approved driving suit ('SFI 3.2A/1' single-layer suits do not meet the stated 2-layer minimum).",
      citation: { ...techForm, section: "Item 13" },
      confidence: "high",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Tech form item 13 groups gloves with the required 2-layer SFI/FIA driving suit ('a minimum of a 2-layer approved SFI or FIA driving suit, gloves and shoes per track mandates'), read here as SFI/FIA-rated gloves required.",
      citation: { ...techForm, section: "Item 13" },
      confidence: "medium",
      notes: "The phrase 'per track mandates' introduces some ambiguity — SCDA may be deferring the exact glove standard to whatever the specific host track separately requires, rather than mandating a certification itself at the org level. Treated here as a certification requirement to stay conservative; worth spot-checking against a specific event's supplemental rules.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same tech-form item 13 language as gloves above — SFI/FIA-rated shoes read as required for a fully caged/track-prepped/race car.",
      citation: { ...techForm, section: "Item 13" },
      confidence: "medium",
      notes: "Same 'per track mandates' ambiguity as gloves — see note there.",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...techForm, section: "Item 13" },
      confidence: "medium",
      notes: "Not mentioned in tech-form item 13 or elsewhere, unlike gloves/shoes.",
    },
    undergarment: notAddressedUndergarment,
    arm_restraint: notAddressedArmRestraint,
    seat: notAddressedSeat,
    belts_harness: beltsHarnessRule,
    window_net: notAddressedWindowNet,
    fire_extinguisher: notAddressedFireExtinguisher,
    fire_suppression: notAddressedFireSuppression,
    fuel_cell: notAddressedFuelCell,
    window_breaker: notAddressedWindowBreaker,
    kill_switch: notAddressedKillSwitch,
    tow_hook: towHookRule,
    tow_rope: notAddressedTowRope,
    emergency_triangle: notAddressedEmergencyTriangle,
    first_aid_kit: notAddressedFirstAidKit,
    hood_pins: notAddressedHoodPins,
    spill_kit: notAddressedSpillKit,
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      citation: { ...techForm, section: "Item 13" },
      confidence: "medium",
      notes:
        "This ruleset's own definition is a car that is 'fully caged, track prepped, or [a] racecar' (tech form item 13: 'Track prepped car means: Vehicle in which the cockpit has been altered or modified in any way so that any part of the chassis or any firewall has been exposed'), so a cage/rollover structure is present by definition of qualifying for this tier — a street-prepared car with an intact interior falls under the other SCDA ruleset instead. The tech form doesn't itself give a construction/tubing spec for the cage (unlike the street ruleset's convertible-specific 'broomstick test' clearance check) — confidence is medium since this is inferred from the class definition rather than a standalone cage-construction rule.",
    },
  },
};

export const scdaRulesets: Ruleset[] = [hpdeStreet, hpdeCaged];
