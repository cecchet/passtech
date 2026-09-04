import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const sourceDoc = {
  title: "New England Hillclimb Association Rules",
  version: "2026 Edition",
  url: "https://www.hillclimb.org/rules_regs/hillclimb_rules/2026rules.pdf",
};

const helmetStandards = [
  { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "SA2015 will be discontinued at the end of the 2026 season per this rulebook's own change note." },
  { standardId: "snell-sa2020", noExpiration: true },
  { standardId: "snell-sa2025", noExpiration: true },
  { standardId: "fia-8860-2010", validityYearsFromLabel: 10, note: "FIA 8860-20XX accepted with a manufacture date under 10 years old." },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
];

const certifiedFiresuitStandards = [
  { standardId: "fia-8856-2000" },
  { standardId: "fia-8856-2018" },
  { standardId: "fia-1986", note: "2026 rules: now requires approved fire-resistant underwear be worn with this standard." },
  { standardId: "sfi-3.2a-5" },
  { standardId: "sfi-3.4-5" },
  { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear." },
];

// NEHA §1.3.12 "Arm Restraints" applies to ALL vehicles regardless of tier, identically.
const armRestraintRule = {
  requirement: "conditional" as const,
  condition:
    "Closed cars with the window raised enough to keep arms inside (or a window net) are exempt. Cars with no roof or convertible tops must wear arm restraints outright. Any car with the window down and no net must wear them.",
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "No certification standard cited by NEHA for this item.",
  satisfiedByAlternative: "window_net" as const,
  citation: { ...sourceDoc, section: "1.3.12.1-1.3.12.2" },
  confidence: "high" as const,
};

// NEHA §1.3.12 "Arm Restraints" also governs window nets, as the alternative to arm restraints — applies to ALL vehicles regardless of tier, identically.
const windowNetRule = {
  requirement: "conditional" as const,
  condition:
    "A window net is one way to satisfy §1.3.12.1 on a closed car whose window can't be raised enough to keep the occupant's arms inside — offered as an alternative to wearing arm restraints, not required in addition to them. Not a legal substitute on cars with no roof or convertible tops, which must wear arm restraints outright regardless of any net (§1.3.12.2).",
  materialOnlyAccepted: true,
  acceptedStandards: [
    { standardId: "sfi-27.1", noExpiration: true },
    { standardId: "fia-8863-2015", noExpiration: true },
  ],
  materialNote: "NEHA §1.3.12.1 just says 'window net(s)' — no certification number or standard is cited, so a plain net satisfies this; a certified net obviously also qualifies if fitted.",
  satisfiedByAlternative: "arm_restraint" as const,
  citation: { ...sourceDoc, section: "1.3.12.1-1.3.12.2" },
  confidence: "high" as const,
};

// NEHA §1.3.9 "Fire Extinguisher" applies to ALL vehicles regardless of tier, identically.
const fireExtinguisherRule = {
  requirement: "required" as const,
  fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
  // §1.3.9: "non-metal straps/latches/brackets not permitted" — the plastic ban here is about the
  // mounting hardware, not the extinguisher's own head/nozzle (no rule text anywhere addresses
  // that). The extra-strap-over-2.5lb clause is the one weight-tiered strap rule found across
  // every body checked so far — modeled as two tiers (2.51 as the boundary rather than 2.5 itself,
  // since the rule says "over 2.5-lb," so an extinguisher at exactly the 2.5lb minimum still only
  // needs the single strap).
  fireExtinguisherMounting: {
    requireMetalBracket: true,
    strapTiers: [
      { underWeightLbs: 2.51, minStraps: 1 },
      { minStraps: 2 },
    ],
    requireAntiTorpedoTabs: true,
  },
  materialNote:
    "Minimum 2.5 lb ABC portable fire extinguisher with a gauge, mounted with a metal bracket and strap (non-metal straps/latches/brackets not permitted). Inspection tag or manufacture date must be within the last 3 years. An anti-torpedo tab is required; the extinguisher must not be mounted on the floor in the driver's footwell, and the primary unit must be within reach of the driver (additional units may be mounted beyond reach). Extinguishers over 2.5-lb net require an additional metal restraining feature beyond the single latching strap.",
  citation: { ...sourceDoc, section: "1.3.9.1-1.3.9.6" },
  confidence: "high" as const,
};

// NEHA §1.3.9.7: onboard fire suppression is only triggered by a nitrous system, for ALL vehicles.
const fireSuppressionRule = {
  requirement: "conditional" as const,
  condition:
    "Required only if the vehicle has a nitrous oxide system — an onboard fire system must be installed in addition to the portable extinguisher.",
  acceptedStandards: [
    { standardId: "fia-8865-2015" },
    { standardId: "sfi-17.1", note: "Must display a manufacturer appearing on the current SFI Spec 17.1 manufacturers list at sfifoundation.com." },
  ],
  materialNote: "The activation control of this system must be indicated with the standard symbol of a red 'E' on a white background.",
  citation: { ...sourceDoc, section: "1.3.9.7" },
  confidence: "high" as const,
};

// NEHA §1.3.14 "Fuel System" applies to ALL vehicles regardless of tier, identically.
const fuelCellRule = {
  requirement: "conditional" as const,
  condition:
    "A stock/OEM gas tank is permitted provided it is sealed from the driver. An SFI- or FIA-approved fuel cell is automatically considered sealed from the driver.",
  materialOnlyAccepted: true,
  acceptedStandards: [
    { standardId: "sfi-28.1" },
    { standardId: "sfi-28.3" },
    { standardId: "fia-ft3-1999" },
    { standardId: "fia-ft3.5-1999" },
    { standardId: "fia-ft5-1999" },
  ],
  materialNote:
    "Tank/cell must be securely mounted and protected, free of leaks, vented to outside air or the EEC system, and not pressurized. Fuel pumps may only operate while the engine is running (except during starting). Fuel lines must be securely mounted and protected from heat, collision, and abrasion. A battery sharing a compartment with the fuel tank must be enclosed in an insulated, securely mounted box.",
  citation: { ...sourceDoc, section: "1.3.14.1-1.3.14.6" },
  confidence: "medium" as const,
  notes:
    "NEHA doesn't name specific SFI/FIA fuel-cell spec numbers, just 'SFI and FIA approved fuel cells' generically — the standards listed here are this app's registered fuel-cell certifications and should satisfy that generic language.",
};

// Categories confirmed absent anywhere in the 2026 rulebook (full read of all 24 pages) — identical for both tiers.
const notAddressedCarCategories = {
  window_breaker: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1. Technical and Safety Requirements" },
    confidence: "high" as const,
    notes:
      "No window breaker / seatbelt cutter tool requirement found anywhere in the rulebook. A window NET is addressed separately, as an alternative to arm restraints — see the Arm Restraint category.",
  },
  tow_hook: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1. Technical and Safety Requirements" },
    confidence: "high" as const,
  },
  tow_rope: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1. Technical and Safety Requirements" },
    confidence: "high" as const,
  },
  emergency_triangle: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1. Technical and Safety Requirements" },
    confidence: "high" as const,
  },
  first_aid_kit: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1. Technical and Safety Requirements" },
    confidence: "high" as const,
    notes: "A medical form is required from each participant (§3.1.3), but no in-car first aid kit requirement is stated.",
  },
  hood_pins: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1. Technical and Safety Requirements" },
    confidence: "high" as const,
    notes:
      "No hood pin / positive hood-latching requirement found anywhere in the rulebook, and no general 'bodywork must be securely fastened' clause either. The only 'hood' reference is §1.4.1.8's 'Fire-retardant hood or helmet skirt in open-engine vehicles' — driver headwear (a balaclava-equivalent item), not a car hood fastener.",
  },
  spill_kit: {
    requirement: "not_addressed" as const,
    citation: { ...sourceDoc, section: "1.1.5, 1.3.10.3" },
    confidence: "high" as const,
    notes:
      "No onboard spill-kit (absorbent material) requirement found. NEHA requires each vehicle to carry a disposal (trash) bag for removing fluid spill debris (§1.3.10.3), and makes drivers responsible for timely cleanup/disposal of any hazmat spill, noting sorbents/brooms are supplied by the club at START and after FINISH rather than carried in the car (§1.1.5) — neither is the same as requiring the car to carry its own absorbent-material kit, so this remains not_addressed for the tracked category.",
  },
};

// "X" / non-competitive entrants: NEHA General Rules for All Vehicles (section 1.3)
const hillclimbX: Ruleset = {
  id: "neha-x",
  bodyId: "neha",
  bodyName: "NEHA (New England Hillclimb Association)",
  disciplineName: "Hillclimb — X / breakout-limited entrant (street cars)",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "1.3 Rules for All Vehicles" }],
  // A single 2-page PDF NEHA uses at the track: page 1 is the general/Non-X form, page 2
  // (this ruleset) is the simplified "X Car" variant.
  techSheet: { url: "/tech-sheets/neha-tech-inspection-form.pdf", format: "PDF" },
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: helmetStandards,
      citation: { ...sourceDoc, section: "1.3.3.1-1.3.3.3" },
      confidence: "high",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "high",
      notes: "HANS/HNR is only required for non-X (competitive) entrants — see the 'Hillclimb — competitive (non-X)' ruleset.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: certifiedFiresuitStandards,
      materialNote:
        "Basic fire-resistant clothing required for all entrants: cotton, linen, leather, or wool — no meltable synthetics. A certified driving suit is NOT required at this tier, but obviously also satisfies it if you have one.",
      citation: { ...sourceDoc, section: "1.3.1" },
      confidence: "high",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "high",
      notes: "Gloves are only required for non-X (competitive) entrants.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Fire-resistant material; no platform, high-heel, open, or sandal-style shoes.",
      citation: { ...sourceDoc, section: "1.3.2" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rule 1.3.1.1: 'Full clothing (minimal exposed skin), long sleeves, long pants, socks' — required to be of fire-resistant material per 1.3.1.2, same as the rest of the base-tier clothing rule.",
      citation: { ...sourceDoc, section: "1.3.1" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.3" },
      confidence: "high",
      notes: "No certified suit required at this tier, so the conditional fire-resistant-underwear rule doesn't apply.",
    },
    arm_restraint: armRestraintRule,
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "No certification standard is required at this tier — the seat must be in safe condition with sufficient framing, reinforcement, mounting, and support, with mountings aligned to harness loads at comparable strength. NEHA explicitly states OE seats and 3-point harness mountings are adequate.",
      citation: { ...sourceDoc, section: "1.3.11.1-1.3.11.2" },
      confidence: "high",
      notes:
        "Seat sliders/rails aren't addressed at this tier. The fixed-back / no-slider requirement for racing seats used with a 5+ point harness only applies to non-X competitive entrants — see the 'Hillclimb — competitive' ruleset. A certified FIA/SFI racing seat obviously also satisfies this, even though NEHA doesn't itself mandate a minimum spec at this tier.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "sfi-16.1" },
        { standardId: "sfi-16.5" },
        { standardId: "fia-8853-2016" },
        { standardId: "fia-8853-98" },
      ],
      materialNote:
        "No certified harness is required at this tier — NEHA's seat rule (1.3.11.2) states 'OE Seats and 3-point harness mountings are adequate,' implying stock 3-point OE belts satisfy the X/breakout-limited tier. A certified 5/6/7-point harness obviously also satisfies this if fitted, and is mandatory at the competitive (non-X) tier.",
      citation: { ...sourceDoc, section: "1.3.11.2 (implied)" },
      confidence: "medium",
    },
    window_net: windowNetRule,
    fire_extinguisher: fireExtinguisherRule,
    fire_suppression: fireSuppressionRule,
    fuel_cell: fuelCellRule,
    kill_switch: {
      requirement: "conditional",
      condition:
        "Not mandated for X/breakout-limited entrants — the mandatory kill-switch rule (1.4.7) applies only to non-X vehicles in the Prepared or Formula Libre class. If a kill switch is installed voluntarily, it must still meet the 1.4.7 marking spec.",
      materialNote: "Where fitted: switch must be obviously marked with a standard lightning bolt symbol, with the off position clearly marked.",
      citation: { ...sourceDoc, section: "1.3.13.5 (referencing 1.4.7)" },
      confidence: "high",
    },
    rollover_protection: {
      requirement: "conditional",
      rolloverProtectionByBodyStyle: { closed_roof: "not_addressed", convertible: "required", open_no_windshield: "required", open_wheel: "required" },
      rolloverProtectionRequiresWelded: false,
      condition:
        "§1.3.20.1: 'Roll bar required in all vehicles with a removable roof' — convertibles and any car with a removable roof/no roof must have one; a fixed hard-roof car isn't addressed at this X/breakout-limited tier. Where fitted, §1.3.20.2 says the roll bar 'should be equivalent in construction to cage specs' — a should, not a shall, so this tier doesn't mandate the full §1.4.6 tubing/mounting spec that the competitive tier requires outright.",
      citation: { ...sourceDoc, section: "1.3.20.1-1.3.20.2" },
      confidence: "high",
    },
    ...notAddressedCarCategories,
  },
};

// Non-X / competitive entrants: NEHA §1.4 "Vehicles Running Faster than Breakout Time"
const hillclimbCompetitive: Ruleset = {
  id: "neha-competitive",
  bodyId: "neha",
  bodyName: "NEHA (New England Hillclimb Association)",
  disciplineName: "Hillclimb — Non-X / no breakout time limit (caged cars only)",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "1.4 Vehicles Running Faster than Breakout Time" }],
  // Same 2-page PDF as the X-car ruleset above: page 1 (this ruleset) is the general/Non-X
  // form, page 2 is the simplified "X Car" variant.
  techSheet: { url: "/tech-sheets/neha-tech-inspection-form.pdf", format: "PDF" },
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: helmetStandards,
      citation: { ...sourceDoc, section: "1.3.3.1-1.3.3.3 (applies to all entrants)" },
      confidence: "high",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "1.4" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true, note: "Required standard for Hybrid-type systems." },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old. All tethers must be less than 5 years old." },
      ],
      citation: { ...sourceDoc, section: "1.4.2.1-1.4.2.4" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: certifiedFiresuitStandards,
      citation: { ...sourceDoc, section: "1.4.1.2" },
      confidence: "high",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "SFI or FIA rated, in good condition (no stains or holes) — a certified item is required at this tier, plain material doesn't qualify.",
      citation: { ...sourceDoc, section: "1.4.1.5" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Fire-resistant material, no platform/high-heel/open/sandal (base rule) plus: uppers of leather or nonflammable material covering at minimum the instep. No certification number required.",
      citation: { ...sourceDoc, section: "1.3.2 and 1.4.1.7" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rule 1.4.1.6: 'Socks made of fire resistant material (e.g., cotton, Nomex). No thermoplastic (meltable) synthetic materials (e.g., nylon, polyester, polypropylene).' No certification number required.",
      citation: { ...sourceDoc, section: "1.4.1.6" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Mandatory if using an SFI 3.2A/1 suit, or (new in 2026) an FIA 1986-standard suit.",
      undergarmentTriggerStandards: ["sfi-3.2a-1", "fia-1986"],
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "NEHA names the standard explicitly here: '(FIA Standard 8856-2000 or SFI 3.3 Specification)' — a certified item is required when this condition applies, not just any fire-resistant material.",
      citation: { ...sourceDoc, section: "1.4.1.2-1.4.1.3" },
      confidence: "high",
    },
    arm_restraint: armRestraintRule,
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "No specific SFI/FIA seat certification standard is mandated. Any altered seat may be deemed unsafe at technical inspection. Seats used with a 5+ point harness must be a fixed-back (as mounted), fully supportive 'racing seat' with the back extending to the shoulder-harness intersection point, sized to fit the driver, with a headrest no more than 3in behind the driver's helmet as seated.",
      citation: { ...sourceDoc, section: "1.3.11.1-1.3.11.2 and 1.4.4.1-1.4.4.4" },
      confidence: "high",
      notes:
        "materialOnlyAccepted is true because §1.4.4 never cites a certification number — but this tier's belts_harness rule (§1.4.3.1) makes a 5-, 6-, or 7-point harness mandatory with no lower-harness option, so the §1.4.4.2 'fixed-back, fully supportive racing seat' construction requirement is always in effect here, not a fallback for some optional higher-harness setup. In practice a true unmodified stock/bench seat won't meet that bar once the required harness is fitted — this mirrors PHA's §8.3.L seat rule. A certified FIA/SFI racing seat obviously also satisfies this, even though NEHA doesn't itself name a minimum spec. Seat sliders/rails are effectively precluded since the seat must be fixed-back 'as mounted.' The seat assembly must mount to substantial structure — OE reinforced mountings, FIA 8855-2010, or the integrated chassis/roll cage — in direct line with the harness loads as worn.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-16.1", validityYearsFromLabel: 5, note: "Also invalid beyond 5 years from date of manufacture if untagged." },
        { standardId: "sfi-16.5", validityYearsFromLabel: 5, note: "Also invalid beyond 5 years from date of manufacture if untagged." },
        { standardId: "fia-8853-2016", validityYearsFromLabel: 5, note: "Also invalid beyond 5 years from date of manufacture if untagged." },
        { standardId: "fia-8853-98", validityYearsFromLabel: 5, note: "Also invalid beyond 5 years from date of manufacture if untagged." },
      ],
      materialNote:
        "5-, 6-, or 7-point harness assembly mandatory. Y- or V-type shoulder harness is NOT permitted. Must be properly mounted and adjusted with correct hardware, in good condition (no visible fading, deterioration, or rust on latching, not altered from original condition). Seat belt and harness anchor points must each be capable of 3300 lbf (15,000 N) applied in line with the harness load; sub-belt points must be capable of half that load. OE anchor points are considered adequate.",
      citation: { ...sourceDoc, section: "1.4.3.1-1.4.3.7" },
      confidence: "high",
    },
    window_net: windowNetRule,
    fire_extinguisher: fireExtinguisherRule,
    fire_suppression: fireSuppressionRule,
    fuel_cell: fuelCellRule,
    kill_switch: {
      requirement: "conditional",
      condition: "Required only for vehicles competing in the Prepared or Formula Libre (FL) class; not mandated for other classes.",
      materialNote: "Switch must cut off/isolate electrical power throughout the vehicle. Must be obviously marked with a standard lightning bolt symbol, with the off position clearly marked.",
      citation: { ...sourceDoc, section: "1.4.7.1-1.4.7.2" },
      confidence: "high",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 1500, minSizes: [{ outerDiameterIn: 1.25, wallThicknessIn: 0.12 }, { outerDiameterIn: 1.38, wallThicknessIn: 0.09 }] },
        { underWeightLbs: 2500, minSizes: [{ outerDiameterIn: 1.38, wallThicknessIn: 0.12 }, { outerDiameterIn: 1.5, wallThicknessIn: 0.09 }] },
        { minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.12 }, { outerDiameterIn: 1.625, wallThicknessIn: 0.109 }, { outerDiameterIn: 1.75, wallThicknessIn: 0.09 }], materialNote: "For over 2500 lbs." },
      ],
      rolloverProtectionRequiresPadding: true,
      citation: { ...sourceDoc, section: "1.4.6.1-1.4.6.12" },
      confidence: "high",
      notes:
        "This tier is 'caged cars only' — a roll cage is required outright, not conditional on body style like the X tier's roll-bar rule. Cage material must be steel mechanical tubing meeting ASTM A500/A513/A519 or SAE xx16-xx30 (>50,000 psi tensile, >36,000 psi yield, ≥10% elongation, Rb>60) — 1018 CDS or 1020 DOM preferred. Mounted at 6 points minimum, with welded mounts socketed/gusseted/plated and bolted foot plates ≥4\"x5\" using 3+ grade-5 (or better) 3/8\" bolts per plate. Must have horizontal/vertical bars above, ahead, behind, and to the sides of the driver's helmet plane; main hoop braced front and/or back with a diagonal member if spanning >36\"; minimum 2 sections of side protection with at least one door-area bar (a stock door beam, outboard frame rail, or rocker panel qualifies); footwell/driveline-intrusion protection (a full continuous stamped OE steel floor qualifies); headrest padded, max 3\" behind the driver's head, with high-density shock-absorbing padding on any cage member reachable by the driver's head. FIA-homologated cages built after 2006 may run as designed with paperwork at tech; earlier FIA cages need an FIA-approved A-pillar support + X-bracing kit retrofit.",
    },
    ...notAddressedCarCategories,
  },
};

export const nehaRulesets: Ruleset[] = [hillclimbX, hillclimbCompetitive];
